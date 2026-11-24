import dns from 'dns/promises';
import fs from 'fs';
import net from 'net';
import mysql from 'mysql2/promise';
import envConfig from '../src/config/env.config';
import sequelize, { buildMysqlSslOptions } from '../src/config/db.config';
import { initAllModels } from '../src/models';

interface StepCheck {
  step: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'BLOCKED';
  detail: string;
}

const checks: StepCheck[] = [];

const testTcpPort = (host: string, port: number, timeoutMs = 5000): Promise<void> =>
  new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`TCP connection timed out after ${timeoutMs}ms`));
    });
    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
  });

const run = async () => {
  console.log('=== Godavari Waves — Cloud MySQL (Aiven) Safe Connection Diagnostics ===\n');
  console.log(`Target Host   : ${envConfig.db.host || '<NOT SET>'}`);
  console.log(`Target Port   : ${envConfig.db.port}`);
  console.log(`Target DB     : ${envConfig.db.name || '<NOT SET>'}`);
  console.log(`DB User       : ${envConfig.db.user ? `${envConfig.db.user.slice(0, 3)}***` : '<NOT SET>'}`);
  console.log(`SSL Enabled   : ${envConfig.db.ssl}`);
  console.log(`CA Cert Path  : ${envConfig.db.caCertPath || '<NONE>'}\n`);

  // Step 0: Check credentials presence (never prints password)
  if (!envConfig.db.host || !envConfig.db.user || !envConfig.db.password || !envConfig.db.name) {
    checks.push({
      step: 'Environment Credentials',
      status: 'BLOCKED',
      detail: 'Missing DB_HOST, DB_USER, DB_PASSWORD, or DB_NAME in employee_dashboard-backend/.env',
    });
    printSummary();
    process.exit(1);
  }

  if (envConfig.db.ssl && envConfig.db.caCertPath && !fs.existsSync(envConfig.db.caCertPath)) {
    checks.push({
      step: 'SSL CA Certificate File',
      status: 'FAIL',
      detail: `CA certificate file not found at ${envConfig.db.caCertPath}`,
    });
    printSummary();
    process.exit(1);
  } else if (envConfig.db.ssl) {
    checks.push({
      step: 'SSL CA Certificate File',
      status: 'PASS',
      detail: envConfig.db.caCertPath ? 'CA certificate loaded safely' : 'TLS enabled using system root CAs',
    });
  }

  // Step 1: DNS Resolution
  try {
    const resolved = await dns.lookup(envConfig.db.host);
    checks.push({ step: 'DNS Resolution', status: 'PASS', detail: `Resolved to ${resolved.address}` });
  } catch (err) {
    checks.push({ step: 'DNS Resolution', status: 'FAIL', detail: (err as Error).message });
    printSummary();
    process.exit(1);
  }

  // Step 2: TCP Port Reachability
  try {
    await testTcpPort(envConfig.db.host, envConfig.db.port);
    checks.push({ step: 'MySQL Port Reachability', status: 'PASS', detail: `TCP port ${envConfig.db.port} reachable` });
  } catch (err) {
    checks.push({ step: 'MySQL Port Reachability', status: 'FAIL', detail: (err as Error).message });
    printSummary();
    process.exit(1);
  }

  // Step 3 & 4: Direct MySQL SSL/TLS + Auth + Database & Schema Read-Only Inspection
  let connection: mysql.Connection | null = null;
  try {
    const ssl = buildMysqlSslOptions();
    connection = await mysql.createConnection({
      host: envConfig.db.host,
      port: envConfig.db.port,
      user: envConfig.db.user,
      password: envConfig.db.password,
      database: envConfig.db.name,
      ...(ssl ? { ssl } : {}),
      connectTimeout: 10000,
    });

    const [versionRows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS db');
    const info = (versionRows as Array<{ version: string; db: string }>)[0];
    checks.push({
      step: 'MySQL Auth & SSL/TLS Handshake',
      status: 'PASS',
      detail: `Connected to MySQL ${info.version} (database: ${info.db})`,
    });

    // Read-only table inspection (never modifies or runs migrations automatically)
    const [tableRows] = await connection.query('SHOW TABLES');
    const tables = (tableRows as Array<Record<string, string>>).map((r) => Object.values(r)[0]);

    if (tables.length === 0) {
      checks.push({
        step: 'Database Schema Inspection',
        status: 'WARN',
        detail: 'Database is EMPTY (0 tables). Safe to initialize via `npm.cmd run migrate` or backend startup.',
      });
    } else {
      checks.push({
        step: 'Database Schema Inspection',
        status: 'PASS',
        detail: `Found ${tables.length} existing table(s): ${tables.slice(0, 12).join(', ')}${tables.length > 12 ? '...' : ''}`,
      });

      if (tables.includes('SequelizeMeta')) {
        const [migRows] = await connection.query('SELECT name FROM SequelizeMeta ORDER BY name ASC');
        const applied = (migRows as Array<{ name: string }>).map((r) => r.name);
        checks.push({
          step: 'Migration Status (SequelizeMeta)',
          status: 'PASS',
          detail: `${applied.length} migration(s) recorded.`,
        });
      } else {
        checks.push({
          step: 'Migration Status (SequelizeMeta)',
          status: 'WARN',
          detail: 'Non-empty DB without SequelizeMeta table — inspect schema before running any migrations.',
        });
      }
    }
  } catch (err) {
    checks.push({
      step: 'MySQL Auth / Database Existence',
      status: 'FAIL',
      detail: (err as Error).message,
    });
    printSummary();
    process.exit(1);
  } finally {
    if (connection) await connection.end().catch(() => {});
  }

  // Step 5: Sequelize Authentication & Model Registration
  try {
    initAllModels(sequelize);
    await sequelize.authenticate();
    checks.push({
      step: 'Sequelize ORM Connection',
      status: 'PASS',
      detail: `Authenticated cleanly with ${Object.keys(sequelize.models).length} models registered.`,
    });
  } catch (err) {
    checks.push({
      step: 'Sequelize ORM Connection',
      status: 'FAIL',
      detail: (err as Error).message,
    });
    printSummary();
    process.exit(1);
  } finally {
    await sequelize.close().catch(() => {});
  }

  printSummary();
};

const printSummary = () => {
  console.log('--- Cloud MySQL Connection Report ---');
  for (const c of checks) {
    console.log(`[${c.status}] ${c.step}: ${c.detail}`);
  }
};

run().catch((err) => {
  console.error('Connection diagnostic error:', (err as Error).message);
  process.exit(1);
});
