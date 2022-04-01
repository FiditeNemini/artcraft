-- noinspection SqlDialectInspectionForFile

CREATE TABLE sentences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sentence varchar(1024) NOT NULL,
  speaker varchar(15) NOT NULL,
  ip_address varchar(30) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fulltext(sentence),
  key(ip_address)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

