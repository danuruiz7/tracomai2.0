-- --------------------------------------------------------
-- Host:                         194.164.173.221
-- Versión del servidor:         8.0.41-0ubuntu0.24.04.1 - (Ubuntu)
-- SO del servidor:              Linux
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para tracomai
CREATE DATABASE IF NOT EXISTS `tracomai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tracomai`;

-- Volcando estructura para tabla tracomai.activity
CREATE TABLE IF NOT EXISTS `activity` (
  `rowid` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `tms` datetime NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `archivos` text,
  `peticion` text,
  PRIMARY KEY (`rowid`),
  KEY `fk_user` (`fk_user`),
  CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`fk_user`) REFERENCES `users` (`rowid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla tracomai.activity: ~0 rows (aproximadamente)

-- Volcando estructura para tabla tracomai.prompts
CREATE TABLE IF NOT EXISTS `prompts` (
  `rowid` int NOT NULL AUTO_INCREMENT,
  `fk_user` int NOT NULL,
  `tms` datetime NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`rowid`),
  KEY `fk_user` (`fk_user`),
  CONSTRAINT `prompts_ibfk_1` FOREIGN KEY (`fk_user`) REFERENCES `users` (`rowid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla tracomai.prompts: ~0 rows (aproximadamente)

-- Volcando estructura para tabla tracomai.users
CREATE TABLE IF NOT EXISTS `users` (
  `rowid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `susbscription` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`rowid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla tracomai.users: ~1 rows (aproximadamente)
INSERT INTO `users` (`rowid`, `name`, `email`, `password_hash`, `created_at`, `updated_at`, `susbscription`) VALUES
	(1, 'admin', 'admin@admin.com', '1234', '2025-02-27 13:06:21', '2025-02-27 13:06:21', '100');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
