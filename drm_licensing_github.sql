-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: drm_licensing
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `active_license_overview`
--

DROP TABLE IF EXISTS `active_license_overview`;
/*!50001 DROP VIEW IF EXISTS `active_license_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `active_license_overview` AS SELECT 
 1 AS `LicenseID`,
 1 AS `AssetTitle`,
 1 AS `Owner`,
 1 AS `Licensee`,
 1 AS `Territory`,
 1 AS `StartDate`,
 1 AS `EndDate`,
 1 AS `LicenseType`,
 1 AS `Exclusivity`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `asset`
--

DROP TABLE IF EXISTS `asset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset` (
  `AssetID` varchar(50) NOT NULL,
  `OwnerID` varchar(50) NOT NULL,
  `Title` varchar(150) NOT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Description` text,
  `Format` varchar(50) DEFAULT NULL,
  `ReleaseDate` date DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`AssetID`),
  KEY `fk_asset_owner` (`OwnerID`),
  CONSTRAINT `fk_asset_owner` FOREIGN KEY (`OwnerID`) REFERENCES `owner` (`OwnerID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset`
--

LOCK TABLES `asset` WRITE;
/*!40000 ALTER TABLE `asset` DISABLE KEYS */;
INSERT INTO `asset` VALUES ('AST001','OWN001','The Last Horizon','Movie','Science fiction feature film','MP4','2025-03-15','Active'),('AST002','OWN002','Summer Nights','Song','Popular music track','MP3','2024-06-20','Active'),('AST003','OWN003','PhotoEditor Pro','Software','Professional image editing software','EXE','2025-01-10','Active'),('AST004','OWN004','Database Systems Handbook','Book','Reference book on database systems','PDF','2024-09-01','Active'),('AST005','OWN001','Digital Shadows','Movie','Crime thriller film','MP4','2025-07-05','Active'),('AST006','OWN005','Ocean Adventures','Movie','Animated family adventure film','MP4','2025-02-12','Active'),('AST007','OWN002','Midnight Drive','Song','Electronic music track','MP3','2025-05-18','Active'),('AST008','OWN003','DataViz Studio','Software','Data visualization software','EXE','2025-04-22','Active'),('AST009','OWN004','Artificial Intelligence Basics','Book','Introductory artificial intelligence textbook','PDF','2025-01-25','Active'),('AST010','OWN005','Robot World','Movie','Animated science fiction movie','MP4','2024-11-10','Active'),('AST011','OWN006','Echoes of Time','Song','Contemporary music track','MP3','2025-08-14','Active'),('AST012','OWN006','City Lights','Song','Urban pop music track','MP3','2024-12-05','Active'),('AST013','OWN001','Hidden Truth','Movie','Mystery thriller film','MP4','2025-06-30','Active'),('AST014','OWN004','Cloud Computing Guide','Book','Guide to modern cloud computing','PDF','2025-03-05','Active'),('AST015','OWN003','SecureCode Toolkit','Software','Software security analysis toolkit','ZIP','2025-09-12','Active');
/*!40000 ALTER TABLE `asset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_sequence`
--

DROP TABLE IF EXISTS `history_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_sequence` (
  `ID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_sequence`
--

LOCK TABLES `history_sequence` WRITE;
/*!40000 ALTER TABLE `history_sequence` DISABLE KEYS */;
INSERT INTO `history_sequence` VALUES (30),(31),(32),(33),(34),(35);
/*!40000 ALTER TABLE `history_sequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `license`
--

DROP TABLE IF EXISTS `license`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license` (
  `LicenseID` varchar(50) NOT NULL,
  `AssetID` varchar(50) NOT NULL,
  `LicenseeID` varchar(50) NOT NULL,
  `TerritoryID` varchar(50) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `LicenseType` varchar(50) DEFAULT NULL,
  `Exclusivity` varchar(50) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `Notes` text,
  `AutoRenew` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`LicenseID`),
  KEY `fk_license_asset` (`AssetID`),
  KEY `fk_license_licensee` (`LicenseeID`),
  KEY `fk_license_territory` (`TerritoryID`),
  CONSTRAINT `fk_license_asset` FOREIGN KEY (`AssetID`) REFERENCES `asset` (`AssetID`) ON UPDATE CASCADE,
  CONSTRAINT `fk_license_licensee` FOREIGN KEY (`LicenseeID`) REFERENCES `licensee` (`LicenseeID`) ON UPDATE CASCADE,
  CONSTRAINT `fk_license_territory` FOREIGN KEY (`TerritoryID`) REFERENCES `territory` (`TerritoryID`) ON UPDATE CASCADE,
  CONSTRAINT `chk_license_dates` CHECK ((`EndDate` >= `StartDate`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license`
--

LOCK TABLES `license` WRITE;
/*!40000 ALTER TABLE `license` DISABLE KEYS */;
INSERT INTO `license` VALUES ('LIC001','AST001','LES001','TER001','2026-01-01','2026-12-31','Streaming','Exclusive','Active','Exclusive streaming rights in USA',0),('LIC002','AST001','LES005','TER003','2026-02-01','2026-11-30','Streaming','Non-Exclusive','Active','European streaming rights',0),('LIC003','AST002','LES002','TER004','2026-01-15','2026-12-31','Music Streaming','Non-Exclusive','Active','Worldwide music streaming',0),('LIC004','AST002','LES006','TER002','2026-03-01','2026-09-30','Music Distribution','Non-Exclusive','Expired','Music distribution in India',0),('LIC005','AST003','LES003','TER002','2026-01-01','2027-02-28','Software','Exclusive','Active','Commercial software license in India',0),('LIC006','AST004','LES004','TER002','2026-01-15','2026-12-31','Digital Distribution','Non-Exclusive','Active','Digital distribution in India',0),('LIC007','AST005','LES001','TER003','2026-04-01','2026-09-30','Streaming','Non-Exclusive','Expired','European streaming license',0),('LIC008','AST006','LES005','TER004','2026-01-01','2027-01-31','Streaming','Exclusive','Active','Worldwide streaming rights',0),('LIC009','AST007','LES002','TER004','2026-02-01','2027-01-31','Music Streaming','Non-Exclusive','Active','Worldwide music streaming',0),('LIC010','AST008','LES003','TER002','2026-03-15','2027-03-14','Software','Non-Exclusive','Active','Software usage in India',0),('LIC011','AST009','LES004','TER005','2026-01-01','2026-12-31','Digital Distribution','Exclusive','Active','UK digital distribution',0),('LIC012','AST010','LES001','TER001','2026-05-01','2026-12-31','Streaming','Non-Exclusive','Active','USA streaming rights',0),('LIC013','AST011','LES002','TER003','2027-11-01','2028-10-31','Music Streaming','Non-Exclusive','Active','European music streaming',0),('LIC014','AST012','LES006','TER004','2026-01-01','2026-06-30','Music Distribution','Non-Exclusive','Expired','Worldwide distribution license',0),('LIC015','AST013','LES005','TER006','2026-06-01','2027-05-31','Streaming','Exclusive','Active','Australia streaming rights',0),('LIC016','AST014','LES004','TER002','2027-02-15','2028-02-14','Digital Distribution','Non-Exclusive','Active','India digital distribution',0),('LIC017','AST015','LES003','TER004','2026-07-01','2027-06-30','Software','Non-Exclusive','Active','Worldwide commercial use',0),('LIC018','AST001','LES006','TER005','2026-06-01','2026-12-31','Distribution','Non-Exclusive','Active','UK distribution rights',0),('LIC019','AST006','LES001','TER001','2026-03-01','2026-12-31','Streaming','Non-Exclusive','Active','USA streaming rights',0),('LIC020','AST013','LES006','TER004','2026-01-01','2026-04-30','Distribution','Non-Exclusive','Expired','Worldwide distribution license',0),('LIC021','AST001','LES001','TER001','2028-01-01','2028-12-31','Non-Exclusive','Non-Exclusive','Active','Test license for operations verification',0);
/*!40000 ALTER TABLE `license` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `license_history`
--

DROP TABLE IF EXISTS `license_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license_history` (
  `HistoryID` varchar(50) NOT NULL,
  `LicenseID` varchar(50) NOT NULL,
  `Action` varchar(100) NOT NULL,
  `ActionDate` datetime NOT NULL,
  `Remarks` text,
  PRIMARY KEY (`HistoryID`),
  KEY `fk_history_license` (`LicenseID`),
  CONSTRAINT `fk_history_license` FOREIGN KEY (`LicenseID`) REFERENCES `license` (`LicenseID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license_history`
--

LOCK TABLES `license_history` WRITE;
/*!40000 ALTER TABLE `license_history` DISABLE KEYS */;
INSERT INTO `license_history` VALUES ('HIS001','LIC001','License Created','2026-01-01 10:00:00','Initial streaming license created'),('HIS002','LIC001','Payment Received','2026-01-05 11:00:00','Initial license payment received'),('HIS003','LIC002','License Created','2026-02-01 10:30:00','European streaming license created'),('HIS004','LIC003','License Created','2026-01-15 09:00:00','Worldwide music license created'),('HIS005','LIC003','Renewal Requested','2026-11-20 14:00:00','Renewal request submitted'),('HIS006','LIC004','License Created','2026-03-01 12:00:00','India distribution license created'),('HIS007','LIC004','License Expired','2026-10-01 00:00:00','License period ended'),('HIS008','LIC005','License Created','2026-01-01 09:30:00','Software license activated'),('HIS009','LIC005','Payment Received','2026-01-03 10:00:00','Initial payment received'),('HIS010','LIC006','License Created','2026-01-15 12:00:00','Digital distribution license created'),('HIS011','LIC006','Renewal Requested','2026-12-10 13:00:00','Renewal request submitted'),('HIS012','LIC007','License Created','2026-04-01 10:00:00','European streaming license created'),('HIS013','LIC007','License Expired','2026-10-01 00:00:00','License period ended'),('HIS014','LIC008','License Created','2026-01-01 11:00:00','Worldwide streaming license created'),('HIS015','LIC008','Renewal Requested','2026-12-05 10:00:00','Renewal approved'),('HIS016','LIC009','License Created','2026-02-01 10:00:00','Worldwide music streaming license'),('HIS017','LIC009','Renewal Requested','2026-12-12 15:00:00','Renewal request submitted'),('HIS018','LIC010','License Created','2026-03-15 09:00:00','Software license activated'),('HIS019','LIC011','License Created','2026-01-01 08:30:00','UK digital distribution license'),('HIS020','LIC011','Renewal Requested','2026-11-25 11:00:00','Renewal approved'),('HIS021','LIC012','License Created','2026-05-01 10:00:00','USA streaming license created'),('HIS022','LIC013','License Created','2026-04-01 10:00:00','European music license created'),('HIS023','LIC014','License Created','2026-01-01 09:00:00','Worldwide distribution license'),('HIS024','LIC014','License Expired','2026-07-01 00:00:00','License period ended'),('HIS025','LIC015','License Created','2026-06-01 10:00:00','Australia streaming license created'),('HIS026','LIC016','License Created','2026-02-15 11:00:00','India digital distribution license'),('HIS027','LIC017','License Created','2026-07-01 09:00:00','Worldwide software license created'),('HIS028','LIC018','License Created','2026-06-01 12:00:00','UK distribution license created'),('HIS029','LIC019','License Created','2026-03-01 10:30:00','USA streaming license created'),('HIS030','LIC020','License Expired','2026-05-01 00:00:00','Worldwide distribution license expired'),('HIS031','LIC013','Renewal Created','2026-10-03 18:04:48','Renewal created from 2026-11-01 to 2027-10-31'),('HIS032','LIC016','Renewal Created','2026-10-03 18:10:37','Renewal created from 2027-02-15 to 2028-02-14'),('HIS033','LIC021','Renewal Created','2026-11-02 18:50:56','Renewal created from 2028-01-01 to 2028-12-31'),('HIS034','LIC013','Renewal Created','2026-11-03 16:28:50','Renewal created from 2027-11-01 to 2028-10-31');
/*!40000 ALTER TABLE `license_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `license_revenue_summary`
--

DROP TABLE IF EXISTS `license_revenue_summary`;
/*!50001 DROP VIEW IF EXISTS `license_revenue_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `license_revenue_summary` AS SELECT 
 1 AS `LicenseID`,
 1 AS `AssetTitle`,
 1 AS `Licensee`,
 1 AS `TotalPaid`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `license_right`
--

DROP TABLE IF EXISTS `license_right`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license_right` (
  `LicenseID` varchar(50) NOT NULL,
  `RightID` varchar(50) NOT NULL,
  `Allowed` tinyint(1) NOT NULL DEFAULT '1',
  `Restrictions` text,
  PRIMARY KEY (`LicenseID`,`RightID`),
  KEY `fk_license_right_right` (`RightID`),
  CONSTRAINT `fk_license_right_license` FOREIGN KEY (`LicenseID`) REFERENCES `license` (`LicenseID`) ON UPDATE CASCADE,
  CONSTRAINT `fk_license_right_right` FOREIGN KEY (`RightID`) REFERENCES `right_ent` (`RightID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license_right`
--

LOCK TABLES `license_right` WRITE;
/*!40000 ALTER TABLE `license_right` DISABLE KEYS */;
INSERT INTO `license_right` VALUES ('LIC001','RGT001',1,'Streaming allowed only within USA'),('LIC001','RGT006',1,'Public exhibition subject to local regulations'),('LIC002','RGT001',1,'Streaming allowed within EU'),('LIC002','RGT002',0,'Downloads not permitted'),('LIC003','RGT001',1,'Audio streaming worldwide'),('LIC003','RGT002',1,'Downloads allowed for premium users'),('LIC004','RGT001',1,'Streaming within India'),('LIC004','RGT005',1,'Digital distribution in India'),('LIC005','RGT003',1,'One authorized copy per installation'),('LIC005','RGT004',0,'Modification of software prohibited'),('LIC005','RGT007',1,'Commercial use allowed for registered businesses'),('LIC006','RGT002',1,'PDF download allowed'),('LIC006','RGT005',1,'Digital distribution within India'),('LIC007','RGT001',1,'Streaming allowed during license period'),('LIC008','RGT001',1,'Worldwide streaming'),('LIC008','RGT002',1,'Offline download permitted'),('LIC009','RGT001',1,'Worldwide audio streaming'),('LIC010','RGT003',1,'Authorized installation only'),('LIC010','RGT007',1,'Commercial use permitted'),('LIC011','RGT002',1,'Digital download in UK'),('LIC011','RGT005',1,'Distribution restricted to UK'),('LIC012','RGT001',1,'Streaming in USA'),('LIC013','RGT001',1,'European streaming rights'),('LIC013','RGT002',1,'Downloads allowed'),('LIC014','RGT005',1,'Worldwide distribution during license period'),('LIC015','RGT001',1,'Streaming in Australia'),('LIC015','RGT006',1,'Public exhibition allowed'),('LIC016','RGT002',1,'Downloads within India'),('LIC016','RGT005',1,'Digital distribution within India'),('LIC017','RGT003',1,'Authorized copies only'),('LIC017','RGT004',0,'Modification prohibited'),('LIC017','RGT007',1,'Commercial use permitted'),('LIC018','RGT005',1,'Distribution limited to UK'),('LIC019','RGT001',1,'Streaming in USA'),('LIC020','RGT005',1,'Worldwide distribution during license period');
/*!40000 ALTER TABLE `license_right` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licensee`
--

DROP TABLE IF EXISTS `licensee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licensee` (
  `LicenseeID` varchar(50) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Organization` varchar(100) DEFAULT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `ContactInfo` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`LicenseeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licensee`
--

LOCK TABLES `licensee` WRITE;
/*!40000 ALTER TABLE `licensee` DISABLE KEYS */;
INSERT INTO `licensee` VALUES ('LES001','Netflix','Netflix Inc.','Streaming Platform','licensing@netflix.example'),('LES002','Spotify','Spotify AB','Music Platform','rights@spotify.example'),('LES003','TechSoft Solutions','TechSoft Pvt Ltd','Software Company','legal@techsoft.example'),('LES004','BookWorld','BookWorld India','Publisher/Distributor','licenses@bookworld.example'),('LES005','Amazon Prime Video','Amazon Inc.','Streaming Platform','content@prime.example'),('LES006','MediaHub','MediaHub Digital','Digital Distributor','licensing@mediahub.example'),('LES007','	Test Media','	Test Media Pvt Ltd','	Digital Distributor','	testmedia@example.com');
/*!40000 ALTER TABLE `licensee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `OwnerID` varchar(50) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Organization` varchar(100) DEFAULT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `ContactInfo` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`OwnerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES ('OWN001','Warner Media','Warner Bros. Discovery','Corporation','newrights@warner.example'),('OWN002','Universal Music Group','Universal Music Group','Corporation','licensing@umg.example'),('OWN003','Adobe Systems','Adobe Inc.','Corporation','rights@adobe.example'),('OWN004','Penguin Publishing','Penguin Random House','Publisher','licensing@penguin.example'),('OWN005','Pixar Studios','Pixar Animation Studios','Studio','rights@pixar.example'),('OWN006','SoundWave Records','SoundWave Entertainment','Music Label','legal@soundwave.example');
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `PaymentID` varchar(50) NOT NULL,
  `LicenseID` varchar(50) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Currency` varchar(10) NOT NULL DEFAULT 'USD',
  `PaymentStatus` varchar(50) DEFAULT NULL,
  `PaymentDate` date NOT NULL,
  `Method` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`PaymentID`),
  KEY `fk_payment_license` (`LicenseID`),
  CONSTRAINT `fk_payment_license` FOREIGN KEY (`LicenseID`) REFERENCES `license` (`LicenseID`) ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK ((`Amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('PAY001','LIC001',50000.00,'USD','Paid','2026-01-05','Bank Transfer'),('PAY002','LIC001',10000.00,'USD','Paid','2026-06-15','Bank Transfer'),('PAY003','LIC002',35000.00,'USD','Paid','2026-02-03','Credit Card'),('PAY004','LIC003',25000.00,'USD','Paid','2026-01-18','Bank Transfer'),('PAY005','LIC003',5000.00,'USD','Pending','2026-07-10','Credit Card'),('PAY006','LIC004',12000.00,'USD','Paid','2026-03-05','Bank Transfer'),('PAY007','LIC005',15000.00,'USD','Paid','2026-01-03','Bank Transfer'),('PAY008','LIC005',5000.00,'USD','Paid','2026-07-01','Bank Transfer'),('PAY009','LIC006',8000.00,'USD','Paid','2026-01-18','Bank Transfer'),('PAY010','LIC007',30000.00,'USD','Paid','2026-04-02','Credit Card'),('PAY011','LIC008',75000.00,'USD','Paid','2026-01-05','Bank Transfer'),('PAY012','LIC008',15000.00,'USD','Paid','2026-07-05','Bank Transfer'),('PAY013','LIC009',22000.00,'USD','Paid','2026-02-05','Credit Card'),('PAY014','LIC010',18000.00,'USD','Paid','2026-03-18','Bank Transfer'),('PAY015','LIC011',12000.00,'USD','Paid','2026-01-05','Credit Card'),('PAY016','LIC012',28000.00,'USD','Paid','2026-05-05','Bank Transfer'),('PAY017','LIC013',16000.00,'USD','Paid','2026-04-05','Credit Card'),('PAY018','LIC014',10000.00,'USD','Paid','2026-01-05','Bank Transfer'),('PAY019','LIC015',45000.00,'USD','Paid','2026-06-05','Bank Transfer'),('PAY020','LIC015',5000.00,'USD','Pending','2026-09-05','Credit Card'),('PAY021','LIC016',9000.00,'USD','Paid','2026-02-18','Bank Transfer'),('PAY022','LIC017',30000.00,'USD','Paid','2026-07-05','Bank Transfer'),('PAY023','LIC018',14000.00,'USD','Paid','2026-06-05','Credit Card'),('PAY024','LIC019',20000.00,'USD','Paid','2026-03-05','Bank Transfer'),('PAY026','LIC021',5000.00,'INR','Paid','2026-11-02','UPI');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `renewal`
--

DROP TABLE IF EXISTS `renewal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `renewal` (
  `RenewalID` varchar(50) NOT NULL,
  `LicenseID` varchar(50) NOT NULL,
  `RenewalDate` date NOT NULL,
  `NewStartDate` date NOT NULL,
  `NewEndDate` date NOT NULL,
  `Status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`RenewalID`),
  KEY `fk_renewal_license` (`LicenseID`),
  CONSTRAINT `fk_renewal_license` FOREIGN KEY (`LicenseID`) REFERENCES `license` (`LicenseID`) ON UPDATE CASCADE,
  CONSTRAINT `chk_renewal_dates` CHECK ((`NewEndDate` >= `NewStartDate`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `renewal`
--

LOCK TABLES `renewal` WRITE;
/*!40000 ALTER TABLE `renewal` DISABLE KEYS */;
INSERT INTO `renewal` VALUES ('REN001','LIC001','2026-11-15','2027-01-01','2027-12-31','Approved'),('REN002','LIC003','2026-11-20','2027-01-15','2028-01-14','Pending'),('REN003','LIC005','2026-12-01','2027-03-01','2028-02-29','Approved'),('REN004','LIC006','2026-12-10','2027-01-15','2027-12-31','Pending'),('REN005','LIC008','2026-12-05','2027-02-01','2028-01-31','Approved'),('REN006','LIC009','2026-12-12','2027-02-01','2028-01-31','Pending'),('REN007','LIC011','2026-11-25','2027-01-01','2027-12-31','Approved'),('REN008','LIC015','2027-04-15','2027-06-01','2028-05-31','Pending'),('REN009','LIC013','2026-10-03','2026-11-01','2027-10-31','Approved'),('REN010','LIC016','2026-10-03','2027-02-15','2028-02-14','Approved'),('REN011','LIC021','2026-11-02','2028-01-01','2028-12-31','Approved'),('REN012','LIC013','2026-11-03','2027-11-01','2028-10-31','Approved');
/*!40000 ALTER TABLE `renewal` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/  /*!50003 TRIGGER `trg_renewal_history` AFTER INSERT ON `renewal` FOR EACH ROW BEGIN
    INSERT INTO HISTORY_SEQUENCE VALUES (NULL);

    INSERT INTO LICENSE_HISTORY
    (
        HistoryID,
        LicenseID,
        Action,
        ActionDate,
        Remarks
    )
    VALUES
    (
        CONCAT(
            'HIS',
            LPAD(LAST_INSERT_ID(), 3, '0')
        ),
        NEW.LicenseID,
        'Renewal Created',
        NOW(),
        CONCAT(
            'Renewal created from ',
            DATE_FORMAT(NEW.NewStartDate, '%Y-%m-%d'),
            ' to ',
            DATE_FORMAT(NEW.NewEndDate, '%Y-%m-%d')
        )
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `right_ent`
--

DROP TABLE IF EXISTS `right_ent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `right_ent` (
  `RightID` varchar(50) NOT NULL,
  `RightName` varchar(100) NOT NULL,
  `Description` text,
  `Category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`RightID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `right_ent`
--

LOCK TABLES `right_ent` WRITE;
/*!40000 ALTER TABLE `right_ent` DISABLE KEYS */;
INSERT INTO `right_ent` VALUES ('RGT001','Streaming','Right to stream digital content online','Distribution'),('RGT002','Download','Right to provide downloadable digital content','Distribution'),('RGT003','Reproduction','Right to reproduce or copy the asset','Copyright'),('RGT004','Modification','Right to modify or adapt the asset','Copyright'),('RGT005','Distribution','Right to distribute the asset','Distribution'),('RGT006','Public Performance','Right to publicly perform or exhibit the asset','Performance'),('RGT007','Commercial Use','Right to use the asset for commercial purposes','Commercial');
/*!40000 ALTER TABLE `right_ent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `territory`
--

DROP TABLE IF EXISTS `territory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `territory` (
  `TerritoryID` varchar(50) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Region` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `Description` text,
  PRIMARY KEY (`TerritoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `territory`
--

LOCK TABLES `territory` WRITE;
/*!40000 ALTER TABLE `territory` DISABLE KEYS */;
INSERT INTO `territory` VALUES ('TER001','United States','North America','USA','United States territory'),('TER002','India','South Asia','India','Indian territory'),('TER003','European Union','Europe','EU','European Union territory'),('TER004','Worldwide','Global','All Countries','Worldwide distribution rights'),('TER005','United Kingdom','Europe','UK','United Kingdom territory'),('TER006','Australia','Oceania','Australia','Australian territory');
/*!40000 ALTER TABLE `territory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'drm_licensing'
--
/*!50003 DROP FUNCTION IF EXISTS `CheckLicenseAvailability` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE FUNCTION `CheckLicenseAvailability`(
    p_AssetID VARCHAR(50),
    p_TerritoryID VARCHAR(50),
    p_CheckDate DATE
) RETURNS varchar(20) CHARSET utf8mb4
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE license_count INT;

    SELECT COUNT(*)
    INTO license_count
    FROM LICENSE
    WHERE AssetID = p_AssetID
      AND TerritoryID = p_TerritoryID
      AND StartDate <= p_CheckDate
      AND EndDate >= p_CheckDate
      AND Status = 'Active';

    IF license_count > 0 THEN
        RETURN 'LICENSED';
    ELSE
        RETURN 'AVAILABLE';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAssetLicenses` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE PROCEDURE `GetAssetLicenses`(IN p_AssetID VARCHAR(50))
BEGIN
    SELECT
        L.LicenseID,
        A.Title AS AssetTitle,
        LE.Name AS Licensee,
        T.Name AS Territory,
        L.StartDate,
        L.EndDate,
        L.LicenseType,
        L.Exclusivity,
        L.Status
    FROM LICENSE L
    JOIN ASSET A
        ON L.AssetID = A.AssetID
    JOIN LICENSEE LE
        ON L.LicenseeID = LE.LicenseeID
    JOIN TERRITORY T
        ON L.TerritoryID = T.TerritoryID
    WHERE L.AssetID = p_AssetID
    ORDER BY L.StartDate;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `active_license_overview`
--

/*!50001 DROP VIEW IF EXISTS `active_license_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `active_license_overview` AS select `l`.`LicenseID` AS `LicenseID`,`a`.`Title` AS `AssetTitle`,`o`.`Name` AS `Owner`,`le`.`Name` AS `Licensee`,`t`.`Name` AS `Territory`,`l`.`StartDate` AS `StartDate`,`l`.`EndDate` AS `EndDate`,`l`.`LicenseType` AS `LicenseType`,`l`.`Exclusivity` AS `Exclusivity` from ((((`license` `l` join `asset` `a` on((`l`.`AssetID` = `a`.`AssetID`))) join `owner` `o` on((`a`.`OwnerID` = `o`.`OwnerID`))) join `licensee` `le` on((`l`.`LicenseeID` = `le`.`LicenseeID`))) join `territory` `t` on((`l`.`TerritoryID` = `t`.`TerritoryID`))) where (`l`.`Status` = 'Active') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `license_revenue_summary`
--

/*!50001 DROP VIEW IF EXISTS `license_revenue_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY DEFINER */
/*!50001 VIEW `license_revenue_summary` AS select `l`.`LicenseID` AS `LicenseID`,`a`.`Title` AS `AssetTitle`,`le`.`Name` AS `Licensee`,coalesce(sum(`p`.`Amount`),0) AS `TotalPaid` from (((`license` `l` join `asset` `a` on((`l`.`AssetID` = `a`.`AssetID`))) join `licensee` `le` on((`l`.`LicenseeID` = `le`.`LicenseeID`))) left join `payment` `p` on((`l`.`LicenseID` = `p`.`LicenseID`))) group by `l`.`LicenseID`,`a`.`Title`,`le`.`Name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 21:40:01
