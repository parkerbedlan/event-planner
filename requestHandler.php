<?php

header("Access-Control-Allow-Origin: http://localhost:3000");

include 'verify.php';
if(!$verified) {
  echo("wrong password");
  return;
}

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
    signIn($user->email, $user->given_name, $user->family_name, $picture);
    $response = json_encode('successfully signed in');
  break;
  case 'getAuthUserProfilePic':
    $func = 'getAuthUserProfilePic';
    $user = json_decode($_POST['user']);
    $picture = file_get_contents($user->picture);
    $response = $picture;
  break;
  case 'getProfilePic':
    $func = 'getProfilePic';
    $emailAddr = json_decode($_POST['emailAddr']);
    $response = file_get_contents("profilePictures/$emailAddr.png");
  break;
  case 'jsonTest':
    $response = json_encode(json_decode($_POST['data']));
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

  if ($profilePicture) {
    addProfilePicture($emailAddr, $profilePicture);
  }
}

function userInTable($emailAddr) {
  $userInTable = $GLOBALS['db']->query(
    "SELECT * FROM Users
    WHERE emailAddr='$emailAddr'"
  );
  return $userInTable;
}

function addUser($emailAddr, $firstName, $lastName) {
  // printf("adding user %s\n", $emailAddr);
  $GLOBALS['db']->query(
    "INSERT INTO Users (emailAddr, firstName, lastName, isActivated)
    VALUES ('$emailAddr', '$firstName', '$lastName', true);"
  );
}

function updateUser($emailAddr, $firstName, $lastName) {
  // printf("updating user %s\n", $emailAddr);
  $GLOBALS['db']->query(
    "UPDATE Users
    SET firstName = '$firstName', lastName = '$lastName', isActivated = true
    WHERE emailAddr='$emailAddr'"
  );
}

function addProfilePicture($emailAddr, $profilePicture) {
  fwrite(fopen("profilePictures/$emailAddr.png","w"), $profilePicture);
}

// idea: add $admins to database too
function createNewEvent($eventName, $ownerEmail, $adminsEmails = null) {
  $db = $GLOBALS['db'];
  // add event
  $result = $db->query(
    "INSERT INTO Events (title) VALUES ('$eventName');"
  );
  if (!$result) return "creating event failed: " . $db->error;

  // add event-owner connection
  $eventId = $db->insert_id;
  echo($eventId);
  $result = $db->query(
    "INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner)
    VALUES ($eventId, '$ownerEmail', true, true);"
  );

  return "success";
}

function test() {
  $name = 'Parker';
}