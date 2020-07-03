<?php

include 'connectToDb.php';

$query = "SELECT emailAddr FROM events_users WHERE eventId=1 AND isAdmin=1";

$result = $db->query($query);
$all_results = [];
for ($i = 0; $i < $result->num_rows; $i ++) {
  array_push($all_results, $result->fetch_object());
}
// echo(json_encode($all_results));

$obj1 = (object) ["emailAddr" => "bedlansonny@gmail.com", "firstName" => "Sonny", "lastName" => "B", "profilePic" => file_get_contents("profilePictures/bedlansonny@gmail.com.png")];
$obj2 = (object) ["emailAddr" => "parkerbedlan@gmail.com", "firstName" => "Parker", "lastName" => "Bedlan", "profilePic" => file_get_contents("profilePictures/parkerbedlan@gmail.com.png")];
print_r($obj2);