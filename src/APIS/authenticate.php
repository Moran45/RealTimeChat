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

// Verificar si el parámetro 'email_or_name' está presente
if (!isset($_POST['email_or_name'])) {
    echo json_encode(['error' => 'Parámetro email_or_name requerido']);
    exit;
}

$email_or_name = $_POST['email_or_name'];

// Verificar si el parámetro 'password' está presente
if (isset($_POST['password'])) {
    // Consultar si es admin
    $sql = "SELECT id, area_id, name, type_admin FROM admin WHERE email = ? OR name = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("ss", $email_or_name, $email_or_name);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'role' => 'admin', 
            'area_id' => $row['area_id'], 
            'user_id' => $row['id'], 
            'name' => $row['name'],
            'type_admin' => $row['type_admin']
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    $stmt->close();
}

// Consultar si es cliente
$sql = "SELECT id, name FROM users WHERE email = ? OR name = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}
$stmt->bind_param("ss", $email_or_name, $email_or_name);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['role' => 'client', 'user_id' => $row['id'], 'name' => $row['name']]);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();

// Crear nuevo usuario si no existe
$name = $email_or_name;
$email = $email_or_name . '@gmail.com'; // Aquí puedes ajustar el formato de email si es necesario

$sql = "INSERT INTO users (name, email, created_at) VALUES (?, ?, NOW())";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}
$stmt->bind_param("ss", $name, $email);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    echo json_encode(['role' => 'client', 'user_id' => $user_id, 'name' => $name]);
} else {
    echo json_encode(['role' => 'desconocido', 'error' => 'No se pudo crear el usuario']);
}

$stmt->close();
$conn->close();
?>
