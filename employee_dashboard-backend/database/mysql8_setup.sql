-- Godavari Wave Technologies Pvt. Ltd. — Employee Management System
-- MySQL 8.0 Database Initialization Script
-- Note: The Node.js backend automatically creates the database, synchronizes all
-- Sequelize models, and idempotently seeds default roles, departments, designations,
-- leave types, holidays, settings, and default accounts on startup.

CREATE DATABASE IF NOT EXISTS `employee_dashboard_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `employee_dashboard_db`;

-- Verify active database & character set
SELECT DATABASE() AS active_database, @@character_set_database AS charset, @@version AS mysql_version;
