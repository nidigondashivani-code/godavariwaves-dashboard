import sequelize from '../src/config/db.config';
import { hashPassword } from '../src/utils/password.util';

async function main() {
  const hash = await hashPassword('Admin@123');
  await sequelize.query(
    `UPDATE users SET is_active = 1, dashboard_access = 'both', password_hash = :hash WHERE email = 'admin@godavariwaves.com'`,
    { replacements: { hash } }
  );
  await sequelize.query(
    `UPDATE employees SET employment_status = 'Active', is_deleted = 0`
  );
  console.log('SUCCESS: Admin user and employees activated with password Admin@123');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
