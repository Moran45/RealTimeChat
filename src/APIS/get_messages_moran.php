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

$client_name = $_GET['client_name'];

$sql = "SELECT * FROM messages WHERE client_name='$client_name' ORDER BY timestamp ASC";
$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(['error' => $conn->error]);
    http_response_code(500);
    exit;
}

$messages = array();

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $messages[] = $row;
  }
}

// Actualizar los mensajes a leídos
$update_sql = "UPDATE messages SET `read` = TRUE WHERE client_name='$client_name' AND `read` = FALSE";
$update_result = $conn->query($update_sql);

if ($update_result === false) {
    echo json_encode(['error' => $conn->error]);
    http_response_code(500);
    exit;
}

echo json_encode($messages);

$conn->close();
?>
