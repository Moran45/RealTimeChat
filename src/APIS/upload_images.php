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
        // Devolver la URL de la imagen en formato JSON
        $imagePath = 'https://phmsoft.tech/Ultimochatlojuro/images/' . $fileName;
        echo json_encode(['image_url' => $imagePath]);
    } else {
        echo json_encode(['error' => 'Error al mover el archivo']);
        http_response_code(500);
    }
} else {
    echo json_encode(['error' => 'No se ha enviado un archivo de imagen']);
    http_response_code(400);
}
?>
