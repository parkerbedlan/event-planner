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
  if (file_exists("profilePictures/$emailAddr.png"))
    $output = file_get_contents("profilePictures/$emailAddr.png");
  else
    $output = null;
  return $output;
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
  for ($i = 0; $i < $result->num_rows; $i++) {
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

function getAdminEmailAddrs() {
  $eventId = $_POST['eventId'];
  $query = "SELECT emailAddr FROM Events_Users WHERE eventId=$eventId AND isAdmin=1";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i++) {
    $userObj = $result->fetch_object()->emailAddr;
    array_push($all_results, $userObj);
  }
  return json_encode($all_results);
}

function getParticipantEmailAddrs() {
  $eventId = $_POST['eventId'];
  $query = "SELECT emailAddr FROM Events_Users WHERE eventId=$eventId AND isAdmin=0";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i++) {
    $userObj = $result->fetch_object()->emailAddr;
    array_push($all_results, $userObj);
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
  $query = "SELECT id, eventId, title, description, startTime, endTime, link, location, everyone FROM Sessions WHERE id=$sessionId";
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

function getUserOwnerEventIds() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $query = "SELECT eventId FROM Events_Users WHERE emailAddr='$emailAddr' AND isOwner=1";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $eventId = (int) $result->fetch_object()->eventId;
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
    if (!userInTable($adminEmailAddr)->num_rows)
    addEmailAddr($adminEmailAddr);
    $db->query("INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner) VALUES ($eventId, \"$adminEmailAddr\", 1, 0)");
  }
  foreach ($participantList as $participantEmailAddr) {
    if (!userInTable($participantEmailAddr)->num_rows)
    addEmailAddr($participantEmailAddr);
    $db->query("INSERT INTO Events_Users (eventId, emailAddr, isAdmin, isOwner) VALUES ($eventId, \"$participantEmailAddr\", 0, 0)");
  }
  return json_encode("added event to database");
}

function getUserEventGroups() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);

  $all_results = [];

  $result = $GLOBALS['db']->query("SELECT groups_users.groupId FROM (groups_users INNER JOIN groups ON groups_users.groupId = groups.id)
  WHERE groups_users.emailAddr='$emailAddr' AND groups.eventId=$eventId;");
  for($i = 0; $i < $result->num_rows; $i++) {
    $groupId = (int) $result->fetch_object()->groupId;
    array_push($all_results, $groupId);
  }

  return json_encode($all_results);
}

function addSession() {
  $db = $GLOBALS['db'];
  $eventId = json_decode($_POST['eventId']);
  $title = json_decode($_POST['title']);
  $description = json_decode($_POST['description']);
  $startTime = json_decode($_POST['startTime']);
  $endTime = json_decode($_POST['endTime']);
  $link = json_decode($_POST['link']);
  $location = json_decode($_POST['location']);
  $everyone = (int)json_decode($_POST['everyone']);

  $db->query("INSERT INTO Sessions (eventId, title, description, startTime, endTime, link, location, everyone) VALUES ($eventId, \"$title\", \"$description\", \"$startTime\", \"$endTime\", \"$link\", \"$location\", $everyone);");
  $sessionId = $db->insert_id;
  
  if (!$everyone) {
    $groups = json_decode($_POST['groups']);
    foreach ($groups as $groupId) {
      $db->query("INSERT INTO Groups_Sessions (groupId, sessionId) VALUES ($groupId, $sessionId);");
    }
  }

  return json_encode("session added");
}

function removeSession() {
  $sessionId = json_decode($_POST['sessionId']);
  $GLOBALS['db']->query("DELETE FROM Sessions WHERE id=$sessionId");
  return json_encode("session removed");
}

function editSession() {
  $db = $GLOBALS['db'];
  // $eventId = json_decode($_POST['eventId']);
  $sessionId = (int)json_decode($_POST['sessionId']);
  $title = json_decode($_POST['title']);
  $description = json_decode($_POST['description']);
  $startTime = json_decode($_POST['startTime']);
  $endTime = json_decode($_POST['endTime']);
  $link = json_decode($_POST['link']);
  $location = json_decode($_POST['location']);
  $everyone = (int)json_decode($_POST['everyone']);

  $db->query("UPDATE Sessions SET title=\"$title\", description=\"$description\", startTime=\"$startTime\", endTime=\"$endTime\", link=\"$link\", location=\"$location\", everyone=$everyone WHERE id=$sessionId");

  return json_encode('not yet implemented');
}

function isOwner() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);
  $result = $GLOBALS['db']->query("SELECT isOwner FROM Events_Users WHERE emailAddr=\"$emailAddr\" AND eventId=$eventId");
  return json_encode((boolean)$result->fetch_object()->isOwner);
}

function renameEvent() {
  $newTitle = json_decode($_POST['newTitle']);
  $newShortTitle = json_decode($_POST['newShortTitle']);
  $eventId = json_decode($_POST['eventId']);

  $GLOBALS['db']->query("UPDATE Events SET title=\"$newTitle\", shortTitle=\"$newShortTitle\" WHERE id=$eventId");
  return json_encode("renamed event");
}

function removeEvent() {
  $eventId = json_decode($_POST['eventId']);

  $GLOBALS['db']->query("DELETE FROM Events WHERE id=$eventId");

  return json_encode('removed event');
}

function getEventData() {
  $id = $_POST['eventId'];
  $query = "SELECT title, shortTitle FROM events WHERE id=$id";
  return json_encode($GLOBALS['db']->query($query)->fetch_object());
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

function getParticipantEventTitles() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $result = $GLOBALS['db']->query("SELECT Events.id, Events.title FROM Events INNER JOIN Events_Users ON Events.id=Events_Users.eventId WHERE Events_Users.emailAddr='$emailAddr' AND Events_Users.isAdmin=0");
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $eventObj = $result->fetch_object();
    array_push($all_results, $eventObj);
  }
  $output = json_encode($all_results);
  return $output;
}

function getAdminEventTitles() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $result = $GLOBALS['db']->query("SELECT Events.id, Events.title, Events.shortTitle FROM Events INNER JOIN Events_Users ON Events.id=Events_Users.eventId WHERE Events_Users.emailAddr='$emailAddr' AND Events_Users.isAdmin=1");
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $eventObj = $result->fetch_object();
    array_push($all_results, $eventObj);
  }
  $output = json_encode($all_results);
  return $output;
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

function getUserEventSessionIds() {
  $db = $GLOBALS['db'];
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);

  $all_results = [];
  
  $result = $db->query("SELECT DISTINCT groups_sessions.sessionId FROM ((groups_sessions
  INNER JOIN groups_users ON groups_sessions.groupId=groups_users.groupId)
  INNER JOIN groups ON groups_sessions.groupId=groups.id)
  WHERE groups_users.emailAddr='$emailAddr'
  AND groups.eventId=$eventId;");
  for ($i = 0; $i < $result->num_rows; $i++) {
    $sessionId = (int) $result->fetch_object()->sessionId;
    array_push($all_results, $sessionId);
  }

  // todo: also get all sessions from that event with the boolean 'everyone'
  $result = $db->query("SELECT id, title, startTime, endTime FROM Sessions WHERE eventId=$eventId AND everyone=1");
  for ($i = 0; $i < $result->num_rows; $i++) {
    $sessionId = (int) $result->fetch_object()->id;
    array_push($all_results, $sessionId);
  }

  return json_encode($all_results);
}

function getUserEventSessions() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);
  $result = $GLOBALS['db']->query("SELECT DISTINCT id, title, startTime, endTime FROM Sessions WHERE eventId=$eventId AND everyone=1 UNION SELECT DISTINCT Sessions.id, Sessions.title, Sessions.startTime, Sessions.endTime FROM ((Sessions INNER JOIN Groups_Sessions ON Sessions.id=Groups_Sessions.sessionId) INNER JOIN Groups_Users ON Groups_Sessions.groupId=Groups_Users.groupId) WHERE Sessions.eventId=$eventId AND Groups_Users.emailAddr='$emailAddr';");
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i++) {
    array_push($all_results, $result->fetch_object());
  }
  $output = json_encode($all_results);
  return $output;
}

function getEventSessionIds() {
  $eventId = $_POST['eventId'];
  $query = "SELECT id FROM Sessions WHERE eventId=$eventId ORDER BY startTime";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionIdObj = (int)$result->fetch_object()->id;
    array_push($all_results, $sessionIdObj);
  }
  return json_encode($all_results);
}

function getEventSessions() {
  $eventId = $_POST['eventId'];
  $query = "SELECT id, title, startTime, endTime FROM Sessions WHERE eventId=$eventId ORDER BY startTime";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionObj = $result->fetch_object();
    $sessionObj->id = (int) $sessionObj->id;
    array_push($all_results, $sessionObj);
  }
  $output = json_encode($all_results);
  return $output;
}

function getEventSessionsDetails() {
  $eventId = json_decode($_POST['eventId']);
  $query = "SELECT description, link, location, everyone FROM Sessions WHERE eventId=$eventId ORDER BY startTime";
  $result = $GLOBALS['db']->query($query);
  $all_results = [];
  for ($i = 0; $i < $result->num_rows; $i ++) {
    $sessionObj = $result->fetch_object();
    $sessionObj->everyone = (boolean) $sessionObj->everyone;
    array_push($all_results, $sessionObj);
  }
  $output = json_encode($all_results);
  return $output;
}

function getEventGroupsAndSize() {
  $db = $GLOBALS['db'];
  $eventId = json_decode($_POST['eventId']);

  $eventSize = (int)$db->query("SELECT COUNT(eventId) AS size FROM events_users WHERE eventId=$eventId")->fetch_object()->size;

  $groups = [];
  $result = $db->query("SELECT groupId AS id, groups.title, Count(*) AS size FROM groups_users INNER JOIN groups ON groups_users.groupId=groups.id WHERE groups.eventId=$eventId GROUP BY id");
  for ($i = 0; $i < $result->num_rows; $i++) {
    $groupObj=$result->fetch_object();
    $groupObj->id = (int)$groupObj->id;
    $groupObj->size = (int)$groupObj->size;
    array_push($groups, $groupObj);
  }

  $eventObj = new stdClass();
  $eventObj->id = $eventId;
  $eventObj->size = $eventSize;
  $eventObj->groups = $groups;

  $output = json_encode($eventObj);

  return $output;

}

function getEventGroups() {
  $db = $GLOBALS['db'];
  $eventId = json_decode($_POST['eventId']);

  $groups = [];
  $result = $db->query("SELECT id, title FROM groups WHERE eventId=$eventId");
  for ($i = 0; $i < $result->num_rows; $i++) {
    $groupObj=$result->fetch_object();
    $groupObj->id = (int)$groupObj->id;
    array_push($groups, $groupObj);
  }

  $eventObj = new stdClass();
  $eventObj->id = $eventId;
  $eventObj->groups = $groups;

  $output = json_encode($eventObj);

  return $output;

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

  if (isset($_POST['groupIds']) && $_POST['groupIds'] != 'null') {
    $isAdmin = (int)$_POST['isAdmin'];
    $groupIds = json_decode($_POST['groupIds']);
    $db->query("DELETE FROM Groups_Users WHERE emailAddr='$emailAddr'");
    for ($i = 0; $i < count($groupIds); $i++) {
      $groupId = $groupIds[$i];
      $db->query("INSERT INTO Groups_Users VALUES ($groupId, '$emailAddr', $isAdmin);");
    }
  }
  
  return json_encode("updated user");
}

function removeUserFromEvent() {
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId = json_decode($_POST['eventId']);

  $GLOBALS['db']->query("DELETE FROM Events_Users WHERE emailAddr='$emailAddr' AND eventId=$eventId");

  return json_encode("deleted user from event");
}

function addUserToEvent() {
  $db = $GLOBALS['db'];
  $emailAddr = json_decode($_POST['emailAddr']);
  $eventId= (int)json_decode($_POST['eventId']);
  $isAdmin = (int)json_decode($_POST['isAdmin']);
  
  $userExists = (boolean)$db->query("SELECT 1 FROM Users WHERE emailAddr='$emailAddr'")->num_rows;
  if(!$userExists) {
    $db->query("INSERT INTO Users (emailAddr, isActivated) VALUES ('$emailAddr', 0)");
  }

  $userIsInEvent = $db->query("SELECT 1 FROM Events_Users WHERE emailAddr='$emailAddr' AND eventId=$eventId")->num_rows;
  if(!$userIsInEvent) {
    $db->query("INSERT INTO Events_Users VALUES ($eventId, '$emailAddr', $isAdmin, 0)");
  }
  else {
    $db->query("UPDATE Events_Users SET isAdmin=$isAdmin, isOwner=0 WHERE emailAddr='$emailAddr' AND eventId=$eventId");
  }

  return json_encode("added user to event");
}