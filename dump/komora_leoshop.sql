-- MySQL dump 10.13  Distrib 5.6.23, for Win32 (x86)
--
-- Host: localhost    Database: komora
-- ------------------------------------------------------
-- Server version	5.7.20-log
create database komora
use komora
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `leoshop`
--

DROP TABLE IF EXISTS `leoshop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leoshop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `new` varchar(45) DEFAULT NULL,
  `sale` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `imgSrc` varchar(45) DEFAULT NULL,
  `price` varchar(45) DEFAULT NULL,
  `oldprice` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leoshop`
--

LOCK TABLES `leoshop` WRITE;
/*!40000 ALTER TABLE `leoshop` DISABLE KEYS */;
INSERT INTO `leoshop` VALUES (1,'true','','First Item','../img/product1.png','388',''),(2,'','','Second Item','../img/product2.png','90',''),(3,'','true','Third Item','../img/product3.png','300','$460'),(4,'','true','Item4','../img/product4.png','180','$270'),(5,'true','','Item5','../img/product5.png','278',''),(6,'','','Item6','../img/product6.png','378',''),(7,'true','','Item7','../img/product7.png','500',''),(8,'','true','Item8','../img/product8.png','200','$460'),(9,'true','','Item9','../img/product9.png','370',''),(10,'true','','Item10','../img/product2.png','388',''),(11,'','','Item11','../img/product1.png','90',''),(12,'','true','Item12','../img/product4.png','300','$460'),(13,'','true','Item13','../img/product5.png','180','$270'),(14,'true','','Item14','../img/product7.png','278',''),(15,'','','Item15','../img/product8.png','378',''),(16,'true','','Item16','../img/product9.png','500',''),(17,'','true','Item17','../img/product9.png','200','$460'),(18,'true','','Item18','../img/product1.png','370',''),(19,'true','','Item19','../img/product4.png','388',''),(20,'','','Item20','../img/product5.png','90',''),(21,'','true','Item21','../img/product6.png','300','$460'),(22,'','true','Item22','../img/product3.png','180','$270'),(23,'true','','Item23','../img/product2.png','278',''),(24,'','','Item24','../img/product1.png','378',''),(25,'true','','Item25','../img/product5.png','500',''),(26,'','true','Item26','../img/product6.png','200','$460'),(27,'true','','Item27','../img/product7.png','370','');
/*!40000 ALTER TABLE `leoshop` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-04 19:53:20
