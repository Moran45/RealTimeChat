<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');

header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto según sea necesario
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php'; // Asegúrate de tener tu conexión a la base de datos configurada aquí

$data = json_decode(file_get_contents('php://input'), true);

// Verificar que todos los parámetros necesarios estén presentes
if (!isset($data['name'], $data['email'], $data['area_id'], $data['contrasena'], $data['type_admin'], $data['user_mom'], $data['user_mom_id'], $data['current_url'])) {
    echo json_encode(['error' => 'Todos los parámetros son requeridos']);
    exit;
}

$name = $data['name'];
$email = $data['email'];
$area_id = (int)$data['area_id']; // Convertir a entero si es necesario
$contrasena = $data['contrasena'];
$type_admin = $data['type_admin']; // Campo de texto
$user_mom = $data['user_mom']; // Campo de texto
$user_mom_id = $data['user_mom_id']; // Campo de texto
$current_url = $data['current_url']; // Campo de texto

// Actualizar la consulta SQL para incluir el campo `current_url`
$sql = "INSERT INTO admin (name, email, area_id, contrasena, type_admin, user_mom, user_mom_id, current_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}

// Asignar los parámetros correctamente (todos son campos de texto o enteros)
$stmt->bind_param('ssisssis', $name, $email, $area_id, $contrasena, $type_admin, $user_mom, $user_mom_id, $current_url);

if ($stmt->execute()) {
    // Obtener el ID del último registro insertado
    $inserted_id = $stmt->insert_id;

    // Devolver los datos registrados, incluidos el ID y los valores proporcionados
    echo json_encode([
        'success' => true,
        'message' => 'Admin creado exitosamente',
        'data' => [
            'id' => $inserted_id,
            'name' => $name,
            'email' => $email,
            'area_id' => $area_id,
            'contrasena' => $contrasena,
            'type_admin' => $type_admin,
            'user_mom' => $user_mom,
            'user_mom_id' => $user_mom_id,
            'current_url' => $current_url,
        ]
    ]);
} else {
    echo json_encode(['error' => 'Error al crear el admin: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
