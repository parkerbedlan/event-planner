<?php

header("Access-Control-Allow-Origin: http://localhost:3000");

include 'connectToDb.php';

$response;

switch($_POST['method']) {
  case 'signIn':
    $user = json_decode($_POST['user']);
    if (strlen($user->email) === 0) {
      $response = json_encode("failed");
      break;
    }
    $picture = file_get_contents($user->picture);
    signIn($user->email, $user->given_name, $user->family_name);
    $response = $picture;
  break;
  case 'getAuthUserProfilePic':
    $user = json_decode($_POST['user']);
    $picture = file_get_contents($user->picture);
    $response = $picture;
  break;
  case 'jsonTest':
    $response = json_encode("success");
  break;
  default:
    $response = json_encode("invalid method");
}

echo $response;

$db->close();

function signIn($emailAddr, $firstName, $lastName, $profilePicture = null) {
  $db = $GLOBALS['db'];

  $userInTable = userInTable($emailAddr);
  $userInTableObj = $userInTable->fetch_object();

  if (!$userInTable->num_rows) {
    addUser($emailAddr, $firstName, $lastName);
  }
  else if (!(bool)$userInTableObj->isActivated) {
    updateUser($emailAddr, $firstName, $lastName);
  }
  else {
    // printf("user %s already in table\n", $emailAddr);
    return;
  }

  // if ($profilePicture) {
  //   addProfilePicture($emailAddr, $profilePicture);
  // }
}

function userInTable($emailAddr) {
  $userInTable = $GLOBALS['db']->query(sprintf(
    "SELECT * FROM Users
    WHERE emailAddr='%s'", $emailAddr
  ));
  return $userInTable;
}

function addUser($emailAddr, $firstName, $lastName) {
  // printf("adding user %s\n", $emailAddr);
  $GLOBALS['db']->query(sprintf(
    "INSERT INTO Users (emailAddr, firstName, lastName, isActivated)
    VALUES ('%s', '%s', '%s', true);", $emailAddr, $firstName, $lastName
  ));
}

function updateUser($emailAddr, $firstName, $lastName) {
  // printf("updating user %s\n", $emailAddr);
  $GLOBALS['db']->query(sprintf(
    "UPDATE Users
    SET firstName = '%s', lastName = '%s', isActivated = true
    WHERE emailAddr='%s'", $firstName, $lastName, $emailAddr
  ));
}

// todo: implement this
function addProfilePicture($emailAddr, $profilePicture) {
  throw new Exception('not implemented');
}

// idea: add $admins to database too
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