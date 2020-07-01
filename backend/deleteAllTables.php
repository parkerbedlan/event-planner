<?php

echo("Are you sure you want to delete all the tables?\n");
$confirmation = "delete";
$input = readline("Type \"".$confirmation."\": ");
if ($input === $confirmation) {
  echo("Deleting...\n");
}
else {
  die("Incorrect confirmation response - not deleting");
}

include 'connectToDb.php';

$db->query("DROP TABLE Events_Users");
$db->query("DROP TABLE Groups_Users");
$db->query("DROP TABLE Groups_Sessions");
$db->query("DROP TABLE Users");
$db->query("DROP TABLE Groups");
$db->query("DROP TABLE Sessions");
$db->query("DROP TABLE Events");

echo("Deletion complete.");