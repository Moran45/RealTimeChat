<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

$servername = "localhost";
$username = "u826891407_ChatVhneUser";
$password = "C123456789a.";
$dbname = "u826891407_ChatVhne";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$client_name = $_POST['client_name'];

$sql = "UPDATE messages SET `read` = TRUE WHERE client_name = ? AND `read` = FALSE";
$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode(['error' => $conn->error]);
  http_response_code(500);
  exit;
}

$stmt->bind_param('s', $client_name);

if ($stmt->execute()) {
  echo json_encode(['success' => 'Messages marked as read']);
} else {
  echo json_encode(['error' => $stmt->error]);
  http_response_code(500);
}

$stmt->close();
$conn->close();
?>
