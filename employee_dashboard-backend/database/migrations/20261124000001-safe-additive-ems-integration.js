'use strict';

/**
 * Safe, non-destructive additive migration for shared Admin + Employee EMS integration.
 * Checks existing tables/columns before adding anything; never drops, truncates, or overwrites data.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const safeAddColumn = async (tableName, columnName, definition) => {
      try {
        const desc = await queryInterface.describeTable(tableName);
        if (!desc[columnName]) {
          await queryInterface.addColumn(tableName, columnName, definition);
        }
      } catch (err) {
        // Table does not exist yet (will be created by initial schema/sync)
        console.warn(`[migration] Skipped ${tableName}.${columnName}: ${err.message}`);
      }
    };

    // Additive Employee lifecycle fields
    await safeAddColumn('employees', 'gender', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await safeAddColumn('employees', 'inactivity_reason', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await safeAddColumn('employees', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await safeAddColumn('employees', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Additive Department metadata fields
    await safeAddColumn('departments', 'monthly_target', {
      type: Sequelize.STRING(180),
      allowNull: true,
    });
    await safeAddColumn('departments', 'active_projects_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // Ensure work_updates table exists (additive only)
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('work_updates')) {
      await queryInterface.createTable('work_updates', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: Sequelize.BIGINT, allowNull: false },
        work_date: { type: Sequelize.DATEONLY, allowNull: false },
        work_description: { type: Sequelize.TEXT, allowNull: false },
        tasks_completed: { type: Sequelize.TEXT, allowNull: true },
        progress: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        hours_spent: { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 0 },
        attachment_url: { type: Sequelize.STRING(500), allowNull: true },
        status: {
          type: Sequelize.ENUM('Pending Review', 'Approved', 'Rejected', 'Revision Required'),
          allowNull: false,
          defaultValue: 'Pending Review',
        },
        admin_feedback: { type: Sequelize.TEXT, allowNull: true },
        reviewed_by: { type: Sequelize.INTEGER, allowNull: true },
        reviewed_at: { type: Sequelize.DATE, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      });
    }
  },

  async down() {
    // Non-destructive down migration: intentionally preserves production columns and records.
  },
};
