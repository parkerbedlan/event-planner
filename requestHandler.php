<?php

include 'connectToDb.php';

// code here

$db->close();


function activateUser($emailAddr, $firstName, $lastName, $profilePicture = null) {
  $db = $GLOBALS['db'];

  $userInTable = $db->query(sprintf(
    "SELECT 1 FROM Users
    WHERE emailAddr='%s'", $emailAddr
  ));

  if (!$userInTable->num_rows) {
    $result = $db->query(sprintf(
      "INSERT INTO Users (emailAddr, firstName, lastName, isActivated)
      VALUES ('%s', '%s', '%s', true);", $emailAddr, $firstName, $lastName
    ));
  }
  else {
    $result = $db->query(sprintf(
      "UPDATE Users
      SET firstName = '%s', lastName = '%s', isActivated = true
      WHERE emailAddr='%s'", $firstName, $lastName, $emailAddr
    ));
  }
  if (!$result) return 'activating user failed: ' . $db->error;

  if ($profilePicture) {
    addProfilePicture($emailAddr, $profilePicture);
  }

  return 'success';
}

function addProfilePicture($emailAddr, $profilePicture) {
  throw new Exception('not implemented');
}

// todo: add $admins to database too
function createNewEvent($eventName, $ownerEmail, $adminsEmails = null) {
  $db = $GLOBALS['db'];
  // add event
  $result = $db->query(sprintf(
    "INSERT INTO Events (title) VALUES ('%s');", $eventName
  ));
  if (!$result) return "creating event failed: " . $db->error;

  // add event-owner connection
  $eventId = $db->insert_id;
  echo($eventId);
  $result = $db->query(sprintf(
    "INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner)
    VALUES (%u, '%s', true, true);", $eventId, $ownerEmail
  ));

  return "success";
}

function test() {
  $name = 'Parker';
}