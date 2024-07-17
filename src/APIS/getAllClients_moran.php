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

// Obtener todos los clientes y el conteo de mensajes no leídos
$sql = "
  SELECT client_name, COUNT(*) as unread_count
  FROM messages
  WHERE `read` = FALSE AND sender = 'Cliente'
  GROUP BY client_name
";

$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(['error' => $conn->error]);
    http_response_code(500);
    exit;
}

$clients = array();

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $clients[] = $row;
  }
}

echo json_encode($clients);

$conn->close();
?>
