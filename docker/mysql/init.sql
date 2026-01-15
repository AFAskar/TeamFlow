-- TeamFlow - MySQL Database Initialization Script
-- This script runs when the MySQL container is first created

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `teamflow` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user for the application (if not using root)
-- This is optional as docker-compose already sets up credentials
-- CREATE USER IF NOT EXISTS 'teamflow'@'%' IDENTIFIED BY 'password';
-- GRANT ALL PRIVILEGES ON teamflow.* TO 'teamflow'@'%';
-- FLUSH PRIVILEGES;

-- Set MySQL mode for better compatibility with Laravel
SET GLOBAL sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Increase packet size for large imports
SET GLOBAL max_allowed_packet = 67108864;

-- Show databases to confirm creation
SHOW DATABASES;
