<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php';

// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');

// Consulta para obtener la cantidad de owner_id con al menos un mensaje sin leer
$sql = "SELECT COUNT(DISTINCT owner_id) AS unread_count FROM message WHERE status = 'unread'";
$result = $conn->query($sql);

if ($result) {
    $row = $result->fetch_assoc();
    echo json_encode(['unread_count' => $row['unread_count']]);
} else {
    echo json_encode(['error' => 'Error al obtener la cantidad de mensajes sin leer']);
}
?>
