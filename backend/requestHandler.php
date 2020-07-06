<?php

header("Access-Control-Allow-Origin: http://localhost:3000");

include 'verify.php';
if(!$verified) {
  echo("wrong password");
  return;
}

include 'connectToDb.php';

include 'userFunctions.php';

echo call_user_func($_POST['method']);

$db->close();

function jsonTest() {
  return json_encode(json_decode($_POST['data']));
}

function signIn() {
  $user = json_decode($_POST['user']);
  if (strlen($user->email) === 0) {
    return json_encode("failed");
  }
  $given_name = isset($user->given_name) ? $user->given_name : $user->nickname;
  $family_name = isset($user->family_name) ? $user->family_name : '';
  $picture = file_get_contents($user->picture);
  signInUser($user->email, $given_name, $family_name, $picture);
  return json_encode('successfully signed in');
}

function getAuthUserProfilePic() {
  $func = 'getAuthUserProfilePic';
  $user = json_decode($_POST['user']);
  $picture = file_get_contents($user->picture);
  return $picture;
}

function getProfilePic() {
  $emailAddr = json_decode($_POST['emailAddr']);
  return file_get_contents("profilePictures/$emailAddr.png");
}

function getEventData() {
  $id = $_POST['eventId'];
  $query = "SELECT title, shortTitle FROM events WHERE id=$id";
  return json_encode($GLOBALS['db']->query($query)->fetch_object());
}

function getUserData() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $query = "SELECT emailAddr, firstName, lastName FROM Users WHERE emailAddr='$emailAddr'";
  $result = $GLOBALS['db']->query($query);
  return json_encode($result->fetch_object());
}

function getAdmins() {
  $id = $_POST['eventId'];
  $query = "SELECT Events_Users.emailAddr, Users.firstName, Users.lastName FROM Events_Users 
  INNER JOIN Users
  ON Events_users.emailAddr=Users.emailAddr
  WHERE eventId=$id AND isAdmin=1";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $userObj = $result->fetch_object();
    array_push($all_results, $userObj);
  }
  return json_encode($all_results);
}

function getParticipants() {
  $id = $_POST['eventId'];
  $query = "SELECT Events_Users.emailAddr, Users.firstName, Users.lastName FROM Events_Users 
  INNER JOIN Users
  ON Events_users.emailAddr=Users.emailAddr
  WHERE eventId=$id AND isAdmin=0";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $userObj = $result->fetch_object();
    array_push($all_results, $userObj);
  }
  return json_encode($all_results);
}

function getEventSessionIds() {
  $eventId = $_POST['eventId'];
  $query = "SELECT id FROM Sessions WHERE eventId=$eventId";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionIdObj = (int)$result->fetch_object()->id;
    array_push($all_results, $sessionIdObj);
  }
  return json_encode($all_results);
}

function getEventGroupIds() {
  $eventId = $_POST['eventId'];
  $query = "SELECT id FROM Groups WHERE eventId=$eventId";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionIdObj = (int)$result->fetch_object()->id;
    array_push($all_results, $sessionIdObj);
  }
  return json_encode($all_results);
}

function getSessionData() {
  $sessionId = $_POST['sessionId'];
  $query = "SELECT id, eventId, title, description, startTime, endTime, link, location FROM Sessions WHERE id=$sessionId";
  $output = json_encode($GLOBALS['db']->query($query)->fetch_object());
  return $output;
}

function getGroupData() {
  $groupId = $_POST['groupId'];
  $query = "SELECT id, eventId, title FROM Groups WHERE id=$groupId";
  $output = json_encode($GLOBALS['db']->query($query)->fetch_object());
  return $output;
}

function getGroupLeaderEmails() {
  $groupId = $_POST['groupId'];
  $query = "SELECT emailAddr FROM Groups_Users WHERE groupId=$groupId AND isLeader=1";
  $all_results = [];
  $result = $GLOBALS['db']->query($query);
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $emailAddr = $result->fetch_object()->emailAddr;
    array_push($all_results, $emailAddr);
  }
  return json_encode($all_results);
}

function getGroupMemberEmails() {
  $groupId = $_POST['groupId'];
  $query = "SELECT emailAddr FROM Groups_Users WHERE groupId=$groupId AND isLeader=0";
  $all_results = [];
  $result = $GLOBALS['db']->query($query);
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $emailAddr = $result->fetch_object()->emailAddr;
    array_push($all_results, $emailAddr);
  }
  return json_encode($all_results);
}

function getGroupSessionIds() {
  $groupId = $_POST['groupId'];
  $query = "SELECT sessionId FROM Groups_Sessions WHERE groupId=$groupId";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i++) {
    $sessionIdObj = $result->fetch_object();
    $sessionId = (int) $sessionIdObj->sessionId;
    array_push($all_results, $sessionId);
  }
  $output = json_encode($all_results);
  return $output;
}

function getSessionGroupIds() {
  $sessionId = $_POST['sessionId'];
  $query = "SELECT groupId FROM Groups_Sessions WHERE sessionId=$sessionId";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i++) {
    $groupIdObj = $result->fetch_object();
    $groupId = (int) $groupIdObj->groupId;
    array_push($all_results, $groupId);
  }
  $output = json_encode($all_results);
  return $output;
}

function getUserGroupIds() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $query = "SELECT groupId FROM Groups_Users WHERE emailAddr='$emailAddr'";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $groupId = (int)$result->fetch_object()->groupId;
    array_push($all_results, $groupId);
  }
  return json_encode($all_results);
}

function getUserAdminEventIds() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $query = "SELECT eventId FROM Events_Users WHERE emailAddr='$emailAddr' AND isAdmin=1";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $eventId = (int) $result->fetch_object()->eventId;
    array_push($all_results, $eventId);
  }
  return json_encode($all_results);
}

function getUserParticipantEventIds() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $query = "SELECT eventId FROM Events_Users WHERE emailAddr='$emailAddr' AND isAdmin=0";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $eventId = $result->fetch_object()->eventId;
    array_push($all_results, $eventId);
  }
  return json_encode($all_results);
}

function getCache() {
  $emailAddr = json_decode($_POST['emailAddr']);
  return file_get_contents("cache/$emailAddr.json");
}

function setCache() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $jsonData = $_POST['jsonData'];
  fwrite(fopen("cache/$emailAddr.json", "w"), $jsonData);
  return json_encode("updated cache");
}

function setUserFirstName() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $firstName = json_decode($_POST['firstName']);
  $query = "UPDATE Users SET firstName=\"$firstName\" WHERE emailAddr='$emailAddr'";
  $result = $GLOBALS['db']->query($query);
  return json_encode($result);
}

function addEvent() {
  $db = $GLOBALS['db'];
  $owner = json_decode($_POST['owner']);
  $title = json_decode($_POST['title']);
  $shortTitle = json_decode($_POST['shortTitle']);
  $groupList = json_decode($_POST['groupList']);
  $adminList = json_decode($_POST['adminList']);
  $participantList = json_decode($_POST['participantList']);
  
  $db->query("INSERT INTO Events (title, shortTitle) VALUES (\"$title\", \"$shortTitle\");");
  $eventId = $db->insert_id;
  foreach ($groupList as $groupTitle) {
    $db->query("INSERT INTO Groups (eventId, title) VALUES ($eventId,\"$groupTitle\");");
  }
  
  $db->query("INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner) VALUES ($eventId, \"$owner\", 1, 1)");
  
  foreach ($adminList as $adminEmailAddr) {
    if (!userInTable($adminEmailAddr))
    addEmailAddr($adminEmailAddr);
    $db->query("INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner) VALUES ($eventId, \"$adminEmailAddr\", 1, 0)");
  }
  foreach ($participantList as $participantEmailAddr) {
    if (!userInTable($participantEmailAddr))
    addEmailAddr($participantEmailAddr);
    $db->query("INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner) VALUES ($eventId, \"$participantEmailAddr\", 0, 0)");
  }
  return json_encode("added event to database");
}

function editUser() {
  $db = $GLOBALS['db'];
  $emailAddr = $_POST['emailAddr'];
  $firstName = $_POST['firstName'];
  $lastName = $_POST['lastName'];
  updateUser($emailAddr, $firstName, $lastName);
  
  if (count($_FILES)) {
    $profilePicture = file_get_contents($_FILES['profilePicture']['tmp_name']);
    fwrite(fopen("profilePictures/$emailAddr.png","wb"),$profilePicture);
  }
  
  return json_encode("updated user");
}

// todo: make it event-specific instead of including all sessions from every event for the user
function getUserEventSessions() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);
  $query = "SELECT DISTINCT groups_sessions.sessionId FROM groups_sessions INNER JOIN groups_users ON groups_sessions.groupId=groups_users.groupId WHERE groups_users.emailAddr='$emailAddr'";
  // $groupIdsQuery = "SELECT groupId FROM Groups_Users WHERE emailAddr='$emailAddr'";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionId = (int) $result->fetch_object()->sessionId;
    array_push($all_results, $sessionId);
  }
  return json_encode($all_results);
}

function addSession() {
  $db = $GLOBALS['db'];
  $eventId = json_decode($_POST['eventId']);
  $title = json_decode($_POST['title']);
  $desc = json_decode($_POST['desc']);
  $startTime = json_decode($_POST['startTime']);
  $endTime = json_decode($_POST['endTime']);
  $link = json_decode($_POST['link']);
  $location = json_decode($_POST['location']);
  $groups = json_decode($_POST['groups']);

  $db->query("INSERT INTO Sessions (eventId, title, description, startTime, endTime, link, location) VALUES ($eventId, \"$title\", \"$desc\", \"$startTime\", \"$endTime\", \"$link\", \"$location\");");
  $sessionId = $db->insert_id;

  foreach ($groups as $groupId) {
    $db->query("INSERT INTO Groups_Sessions (groupId, sessionId) VALUES ($groupId, $sessionId);");
  }

  return json_encode("session added");
}