<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *"); // Permitir todas las solicitudes de origen (puedes restringirlo a tu dominio)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php';

// Obtener el user_id de la solicitud POST o GET
$user_id = $_POST['user_id'] ?? $_GET['user_id'] ?? null;

if ($user_id === null) {
    echo json_encode(['error' => 'User ID is required.']);
    exit;
}

// Datos predeterminados
$servicio = 'Max';
$correo = 'hbomax22@gmail.com';
$contrasena = 'preuba83';
$perfiles = 'P1';
$pin = '1040';
$problema = 'Cuenta caida, favor de arreglarlo';

$sql = "INSERT INTO reportes (usuario, servicio, correo, contrasena, perfiles, pin, problema) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['error' => 'Failed to prepare statement']);
    exit;
}

$stmt->bind_param("issssss", $user_id, $servicio, $correo, $contrasena, $perfiles, $pin, $problema);

if ($stmt->execute()) {
    $report_id = $stmt->insert_id;
    $report_data = [
        'reporte_id' => $report_id,
        'usuario' => $user_id,
        'servicio' => $servicio,
        'correo' => $correo,
        'contrasena' => $contrasena,
        'perfiles' => $perfiles,
        'pin' => $pin,
        'problema' => $problema
    ];
    echo json_encode(['success' => true, 'report' => $report_data]);
} else {
    echo json_encode(['error' => 'Error al insertar el reporte']);
}

$stmt->close();
$conn->close();
?>

