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

$email_or_name = $_POST['email_or_name'];

// Consultar si es admin
$sql = "SELECT id, area_id, name FROM admin WHERE email = ? OR name = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email_or_name, $email_or_name);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['role' => 'admin', 'area_id' => $row['area_id'], 'user_id' => $row['id'] , 'name' => $row['name']]);
    exit;
}

// Consultar si es cliente
$sql = "SELECT id FROM users WHERE email = ? OR name = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email_or_name, $email_or_name);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['role' => 'client', 'user_id' => $row['id']]);
    exit;
}

echo json_encode(['role' => 'unknown']);
?>