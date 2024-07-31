<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit;
}

include 'db.php';

// Establecer la zona horaria correcta
date_default_timezone_set('America/Mexico_City');

// Verificar y sanitizar entradas
$chat_id = isset($_POST['chat_id']) ? intval($_POST['chat_id']) : null;
$owner_id = isset($_POST['owner_id']) ? intval($_POST['owner_id']) : null;
$IsAdmin = isset($_POST['IsAdmin']) ? intval($_POST['IsAdmin']) : null; // Añadir el campo IsAdmin
$chat_finalized = isset($_POST['chat_finalized']) ? intval($_POST['chat_finalized']) : 0; // Añadir el campo chat_finalized

// Validar que los parámetros necesarios no estén vacíos
if ($chat_id === null || $owner_id === null || $IsAdmin === null) {
    echo json_encode(['error' => 'Parámetros incompletos']);
    http_response_code(400);
    exit;
}

// Verificar si se ha enviado un archivo
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    // Validar el archivo
    $fileTmpPath = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];
    $fileType = $_FILES['image']['type'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    // Validar la extensión del archivo (solo imágenes)
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($fileExtension, $allowedExts)) {
        echo json_encode(['error' => 'Tipo de archivo no permitido']);
        http_response_code(400);
        exit;
    }

    // Mover el archivo al directorio de destino
    $uploadFileDir = $_SERVER['DOCUMENT_ROOT'] . "/Ultimochatlojuro/images/";
    $dest_path = $uploadFileDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $dest_path)) {
        // Guardar la información de la imagen en la base de datos
        $imagePath = '/Ultimochatlojuro/images/' . $fileName;
        $status = $IsAdmin === 1 ? 'read' : 'unread';

        $sql = "INSERT INTO message (chat_id, text, owner_id, timestamp, status, IsAdmin, chat_finalized, image_path) VALUES (?, '', ?, NOW(), ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);

        if ($stmt === false) {
            echo json_encode(['error' => 'Error en la preparación de la consulta']);
            http_response_code(500);
            exit;
        }

        $stmt->bind_param("isisii", $chat_id, $owner_id, $status, $IsAdmin, $chat_finalized, $imagePath);

        if ($stmt->execute()) {
            echo json_encode([
                'id' => $stmt->insert_id,
                'chat_id' => $chat_id,
                'owner_id' => $owner_id,
                'timestamp' => date('Y-m-d H:i:s'),
                'status' => $status,
                'IsAdmin' => $IsAdmin,
                'chat_finalized' => $chat_finalized,
                'image_path' => $imagePath
            ]);
        } else {
            echo json_encode(['error' => 'Error al guardar el mensaje']);
            http_response_code(500);
        }
    } else {
        echo json_encode(['error' => 'Error al mover el archivo']);
        http_response_code(500);
    }
} else {
    echo json_encode(['error' => 'No se ha enviado un archivo de imagen']);
    http_response_code(400);
}
?>
