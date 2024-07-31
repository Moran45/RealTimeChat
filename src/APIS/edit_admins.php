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

if (!isset($data['name'], $data['email'], $data['area_id'], $data['contrasena'], $data['type_admin'], $data['id'])) {
    echo json_encode(['error' => 'Todos los parámetros son requeridos']);
    exit;
}

$id = (int)$data['id']; // Identificador del registro a actualizar
$name = $data['name'];
$email = $data['email'];
$area_id = (int)$data['area_id']; // Convertir a entero si es necesario
$contrasena = $data['contrasena'];
$type_admin = $data['type_admin']; // Campo de texto

// Consulta de actualización
$sql = "UPDATE admin SET name = ?, email = ?, area_id = ?, contrasena = ?, type_admin = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    exit;
}

// Asignar los parámetros correctamente (todos son campos de texto o enteros)
$stmt->bind_param('ssissi', $name, $email, $area_id, $contrasena, $type_admin, $id);

if ($stmt->execute()) {
    // Devolver los datos actualizados
    echo json_encode([
        'success' => true,
        'message' => 'Admin actualizado exitosamente',
        'data' => [
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'area_id' => $area_id,
            'contrasena' => $contrasena,
            'type_admin' => $type_admin,
        ]
    ]);
} else {
    echo json_encode(['error' => 'Error al actualizar el admin: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
