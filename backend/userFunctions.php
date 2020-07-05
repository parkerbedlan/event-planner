<?php

function signInUser($emailAddr, $firstName, $lastName, $profilePicture = null) {
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
    VALUES ('$emailAddr', \"$firstName\", \"$lastName\", true);"
  );
}

function updateUser($emailAddr, $firstName, $lastName) {
  // printf("updating user %s\n", $emailAddr);
  $GLOBALS['db']->query(
    "UPDATE Users
    SET firstName = \"$firstName\", lastName = \"$lastName\", isActivated = true
    WHERE emailAddr='$emailAddr'"
  );
}

function addProfilePicture($emailAddr, $profilePicture) {
  fwrite(fopen("profilePictures/$emailAddr.png","w"), $profilePicture);
}

function addEmailAddr($emailAddr) {
  $GLOBALS['db']->query("INSERT INTO Users (emailAddr) VALUES (\"$emailAddr\"");
}