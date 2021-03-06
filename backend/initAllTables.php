<?php

include 'connectToDb.php';

if (!tableExists("Events")) {
  $db->query(
    "CREATE TABLE `Events` (
      id serial,
      title VARCHAR(63) NOT NULL,
      shortTitle VARCHAR(24) NOT NULL,
      PRIMARY KEY (id)
    );"
  );
}

if (!tableExists("Sessions")) {
  $db->query(
    "CREATE TABLE `Sessions` (
      id serial,
      eventId BIGINT UNSIGNED NOT NULL,
      title VARCHAR(63) NOT NULL,
      description VARCHAR(255),
      startTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      endTime timestamp NOT NULL DEFAULT startTime,
      link VARCHAR(255),
      location VARCHAR(127),
      everyone bit NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE
    );"
  );
}

if (!tableExists("Users")) {
  $db->query(
    "CREATE TABLE `Users` (
      emailAddr VARCHAR(255) NOT NULL,
      firstName VARCHAR(31),
      lastName VARCHAR(31),
      isActivated bit NOT NULL,
      PRIMARY KEY (emailAddr)
    );"
  );
}

if (!tableExists("Groups")) {
  $db->query(
    "CREATE TABLE `Groups` (
      id serial,
      eventId BIGINT UNSIGNED NOT NULL,
      title VARCHAR(63) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE
    );"
  );
}

if (!tableExists("Events_Users")) {
  $db->query(
    "CREATE TABLE `Events_Users` (
      eventId BIGINT UNSIGNED NOT NULL,
      emailAddr VARCHAR(255) NOT NULL,
      isAdmin bit NOT NULL,
      isOwner bit NOT NULL,
      FOREIGN KEY (eventId) REFERENCES Events(id) ON DELETE CASCADE,
      FOREIGN KEY (emailAddr) REFERENCES Users(emailAddr) ON DELETE CASCADE
    );"
  );
}

if (!tableExists("Groups_Users")) {
  $db->query(
    "CREATE TABLE `Groups_Users` (
      groupId BIGINT UNSIGNED NOT NULL,
      emailAddr VARCHAR(255) NOT NULL,
      isLeader bit NOT NULL,
      FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
      FOREIGN KEY (emailAddr) REFERENCES Users(emailAddr) ON DELETE CASCADE
    );"
  );
}

if (!tableExists("Groups_Sessions")) {
  $db->query(
    "CREATE TABLE `Groups_Sessions` (
      groupId BIGINT UNSIGNED NOT NULL,
      sessionId BIGINT UNSIGNED NOT NULL,
      FOREIGN KEY (groupId) REFERENCES Groups(id) ON DELETE CASCADE,
      FOREIGN KEY (sessionId) REFERENCES Sessions(id) ON DELETE CASCADE
    );"
  );
}

$db->close();


function tableExists($tableName) {
  $result = $GLOBALS['db']->query("select 1 from " . $tableName . " LIMIT 1");
  $exists = $result !== false;
  if ($exists)
    $result->free_result();
  return $exists;
}