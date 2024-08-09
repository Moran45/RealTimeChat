-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 09-08-2024 a las 04:30:49
-- Versión del servidor: 10.11.8-MariaDB-cll-lve
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u826891407_ChatVhne`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `area_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `contrasena` varchar(255) NOT NULL,
  `type_admin` varchar(255) NOT NULL DEFAULT 'Sub',
  `user_mom` varchar(100) NOT NULL,
  `user_mom_id` int(10) NOT NULL,
  `current_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `area_id`, `created_at`, `contrasena`, `type_admin`, `user_mom`, `user_mom_id`, `current_url`) VALUES
(1, 'admin', 'admin@gmail.com', 2, '2024-07-31 19:23:34', '1234', 'Full', '', 0, 'http://localhost:3000/client'),
(2, 'hugo', 'hugo@ucol.mx', 2, '2024-08-09 01:31:05', '1234', 'Sub', 'admin', 1, 'http://localhost:3000/client');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `name`) VALUES
(4, 'chatsFinished'),
(1, 'Develop'),
(3, 'FrontEnd'),
(2, 'Marketing');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chats`
--

CREATE TABLE `chats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `area_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `current_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `chats`
--

INSERT INTO `chats` (`id`, `user_id`, `user_name`, `area_id`, `created_at`, `updated_at`, `current_url`) VALUES
(76, 31, 'Jaime', 1, '2024-08-08 23:36:32', '2024-08-08 23:36:32', 'undefined'),
(77, 31, 'Jaime', 1, '2024-08-08 23:49:34', '2024-08-08 23:49:34', 'http://localhost:3000/client'),
(78, 30, 'Juan', 1, '2024-08-08 23:58:13', '2024-08-08 23:58:13', 'http://localhost:3000/client'),
(79, 1, 'Prueba', 1, '2024-08-09 02:39:41', '2024-08-09 02:39:41', 'http://localhost:3000/client'),
(80, 1, 'Prueba', 2, '2024-08-09 02:40:13', '2024-08-09 02:40:13', 'http://localhost:3000/client');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `message`
--

CREATE TABLE `message` (
  `id` int(20) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `image_path` text NOT NULL,
  `owner_id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('unread','read') DEFAULT 'unread',
  `IsAdmin` int(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `chat_finalized` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `message`
--

INSERT INTO `message` (`id`, `chat_id`, `text`, `image_path`, `owner_id`, `timestamp`, `status`, `IsAdmin`, `user`, `chat_finalized`) VALUES
(1, 76, 'f', '', 31, '2024-08-08 23:36:34', 'unread', 0, '', 0),
(2, 76, 'm', '', 31, '2024-08-08 23:37:15', 'unread', 0, '', 0),
(3, 76, 'f', '', 31, '2024-08-08 23:38:43', 'unread', 0, '', 0),
(4, 77, 'hol', '', 31, '2024-08-08 23:49:46', 'read', 0, '', 0),
(5, 77, 'hj', '', 31, '2024-08-08 23:49:58', 'read', 0, '', 0),
(6, 77, 'kmk', '', 31, '2024-08-08 23:57:29', 'read', 0, '', 0),
(7, 77, 'k', '', 31, '2024-08-08 23:57:31', 'read', 0, '', 0),
(8, 77, '', '', 31, '2024-08-08 23:57:34', 'read', 0, '', 0),
(9, 78, 'k', '', 30, '2024-08-08 23:58:19', 'read', 0, '', 0),
(10, 78, 'kk', '', 30, '2024-08-09 00:11:53', 'read', 0, '', 0),
(11, 78, 'kj', '', 30, '2024-08-09 00:11:54', 'read', 0, '', 0),
(12, 78, '', '', 30, '2024-08-09 00:11:54', 'read', 0, '', 0),
(13, 78, 'o', '', 30, '2024-08-09 00:11:55', 'read', 0, '', 0),
(14, 78, 'o', '', 30, '2024-08-09 00:11:55', 'read', 0, '', 0),
(15, 78, 'o', '', 30, '2024-08-09 00:11:56', 'read', 0, '', 0),
(16, 78, 'ff', '', 1, '2024-08-09 00:15:39', 'read', 1, '', 0),
(17, 78, 'gf', '', 1, '2024-08-09 00:15:40', 'read', 1, '', 0),
(18, 78, 'gf', '', 1, '2024-08-09 00:15:40', 'read', 1, '', 0),
(19, 78, 'Reporte finalizado', '', 1, '2024-08-09 00:16:35', 'read', 1, '', 1),
(20, 78, 'Área seleccionada: Problemas con mi cuenta', '', 30, '2024-08-09 00:16:38', 'read', 0, '', 0),
(21, 78, 'ff', '', 30, '2024-08-09 00:16:39', 'read', 0, '', 0),
(22, 78, 'df', '', 30, '2024-08-09 00:16:40', 'read', 0, '', 0),
(23, 78, 'fd', '', 30, '2024-08-09 00:16:44', 'read', 0, '', 0),
(24, 78, 'f', '', 1, '2024-08-09 00:16:47', 'read', 1, '', 0),
(25, 78, 'jk4', '', 30, '2024-08-09 00:29:06', 'read', 0, '', 0),
(26, 78, 'd', '', 30, '2024-08-09 00:29:41', 'read', 0, '', 0),
(27, 78, 'ff4', '', 30, '2024-08-09 00:36:34', 'read', 0, '', 0),
(28, 78, '', '', 30, '2024-08-09 00:36:50', 'read', 0, '', 0),
(29, 78, 'fddf', '', 30, '2024-08-09 00:36:50', 'read', 0, '', 0),
(30, 78, 'eer', '', 30, '2024-08-09 00:36:51', 'read', 0, '', 0),
(31, 78, 'erer}', '', 30, '2024-08-09 00:36:56', 'read', 0, '', 0),
(32, 78, 'erer', '', 30, '2024-08-09 00:37:03', 'read', 0, '', 0),
(33, 78, 'jj', '', 30, '2024-08-09 00:47:23', 'read', 0, '', 0),
(34, 78, 'kmkm', '', 30, '2024-08-09 00:47:36', 'read', 0, '', 0),
(35, 77, 'k', '', 31, '2024-08-09 00:48:04', 'read', 0, '', 0),
(36, 77, 'jj+', '', 31, '2024-08-09 00:48:09', 'read', 0, '', 0),
(37, 77, 'jo', '', 31, '2024-08-09 00:48:10', 'read', 0, '', 0),
(38, 77, 'hjk}', '', 31, '2024-08-09 00:48:13', 'read', 0, '', 0),
(39, 77, 'j}', '', 31, '2024-08-09 00:48:14', 'read', 0, '', 0),
(40, 77, 'pk', '', 31, '2024-08-09 00:48:15', 'read', 0, '', 0),
(41, 77, '', '', 31, '2024-08-09 00:48:15', 'read', 0, '', 0),
(42, 77, 'k', '', 31, '2024-08-09 00:48:16', 'read', 0, '', 0),
(43, 77, 'h', '', 31, '2024-08-09 00:48:19', 'read', 0, '', 0),
(44, 77, 'hjn}', '', 31, '2024-08-09 00:48:36', 'read', 0, '', 0),
(45, 77, ',', '', 31, '2024-08-09 00:48:42', 'read', 0, '', 0),
(46, 77, '', '', 31, '2024-08-09 00:48:44', 'read', 0, '', 0),
(47, 78, 'k', '', 30, '2024-08-09 00:49:03', 'read', 0, '', 0),
(48, 78, '', '', 30, '2024-08-09 00:49:04', 'read', 0, '', 0),
(49, 78, 'kl', '', 30, '2024-08-09 00:49:06', 'read', 0, '', 0),
(50, 78, 'j', '', 30, '2024-08-09 00:49:08', 'read', 0, '', 0),
(51, 78, 'k', '', 30, '2024-08-09 00:49:09', 'read', 0, '', 0),
(52, 78, 'km', '', 30, '2024-08-09 00:49:10', 'read', 0, '', 0),
(53, 78, 'k', '', 30, '2024-08-09 00:49:11', 'read', 0, '', 0),
(54, 78, 'k', '', 30, '2024-08-09 00:49:12', 'read', 0, '', 0),
(55, 78, 'k', '', 30, '2024-08-09 00:49:14', 'read', 0, '', 0),
(56, 78, 'lkhj', '', 30, '2024-08-09 00:49:21', 'read', 0, '', 0),
(57, 78, 'o', '', 30, '2024-08-09 00:49:22', 'read', 0, '', 0),
(58, 78, 'm', '', 30, '2024-08-09 00:49:44', 'read', 0, '', 0),
(59, 78, ',4', '', 30, '2024-08-09 00:51:56', 'read', 0, '', 0),
(60, 78, 'dssd', '', 30, '2024-08-09 00:59:14', 'read', 0, '', 0),
(61, 78, 'k', '', 30, '2024-08-09 00:59:22', 'read', 0, '', 0),
(62, 78, 'm', '', 30, '2024-08-09 00:59:39', 'read', 0, '', 0),
(63, 78, 'nn}', '', 30, '2024-08-09 00:59:45', 'read', 0, '', 0),
(64, 78, 'hbbhj', '', 30, '2024-08-09 00:59:49', 'read', 0, '', 0),
(65, 78, 'f', '', 30, '2024-08-09 01:01:13', 'read', 0, '', 0),
(66, 78, 'f', '', 30, '2024-08-09 01:01:17', 'read', 0, '', 0),
(67, 78, 'l4', '', 30, '2024-08-09 01:01:39', 'read', 0, '', 0),
(68, 77, 'd', '', 31, '2024-08-09 01:03:21', 'read', 0, '', 0),
(69, 77, 'df', '', 31, '2024-08-09 01:03:22', 'read', 0, '', 0),
(70, 77, 'df', '', 31, '2024-08-09 01:03:25', 'read', 0, '', 0),
(71, 77, 'fd', '', 31, '2024-08-09 01:03:36', 'read', 0, '', 0),
(72, 77, 'df', '', 31, '2024-08-09 01:03:37', 'read', 0, '', 0),
(73, 77, 'df', '', 31, '2024-08-09 01:03:38', 'read', 0, '', 0),
(74, 77, 's', '', 31, '2024-08-09 01:04:00', 'read', 0, '', 0),
(75, 77, 's', '', 31, '2024-08-09 01:04:01', 'read', 0, '', 0),
(76, 77, 'd', '', 31, '2024-08-09 01:04:04', 'read', 0, '', 0),
(77, 77, 'Reporte finalizado', '', 1, '2024-08-09 01:04:14', 'read', 1, '', 1),
(78, 77, 'Área seleccionada: Problemas con mi cuenta', '', 31, '2024-08-09 01:04:15', 'read', 0, '', 0),
(79, 77, 'm', '', 31, '2024-08-09 01:04:26', 'read', 0, '', 0),
(80, 77, '', '', 31, '2024-08-09 01:04:27', 'read', 0, '', 0),
(81, 77, 'ljk}', '', 31, '2024-08-09 01:04:46', 'read', 0, '', 0),
(82, 77, 'Reporte finalizado', '', 1, '2024-08-09 01:04:52', 'read', 1, '', 1),
(83, 77, 'Área seleccionada: Problemas con mi cuenta', '', 31, '2024-08-09 01:04:56', 'read', 0, '', 0),
(84, 77, 'm', '', 31, '2024-08-09 01:06:05', 'read', 0, '', 0),
(85, 77, 'n', '', 31, '2024-08-09 01:06:15', 'read', 0, '', 0),
(86, 77, 'Reporte finalizado', '', 1, '2024-08-09 01:07:54', 'read', 1, '', 1),
(87, 77, 'Área seleccionada: Problemas con mi cuenta', '', 31, '2024-08-09 01:07:58', 'read', 0, '', 0),
(88, 78, 'c', '', 30, '2024-08-09 01:09:37', 'read', 0, '', 0),
(89, 78, '', '', 30, '2024-08-09 01:09:38', 'read', 0, '', 0),
(90, 78, 'd', '', 30, '2024-08-09 01:09:39', 'read', 0, '', 0),
(91, 78, 'fdfdffd', '', 1, '2024-08-09 01:09:46', 'read', 1, '', 0),
(92, 78, '', '', 1, '2024-08-09 01:09:46', 'read', 1, '', 0),
(93, 78, 'f', '', 1, '2024-08-09 01:09:46', 'read', 1, '', 0),
(94, 78, 'fd', '', 1, '2024-08-09 01:09:47', 'read', 1, '', 0),
(95, 78, 'Reporte finalizado', '', 1, '2024-08-09 01:09:49', 'read', 1, '', 1),
(96, 78, 'Área seleccionada: Problemas con mi cuenta', '', 30, '2024-08-09 01:09:55', 'read', 0, '', 0),
(97, 78, 'l', '', 30, '2024-08-09 01:10:04', 'read', 0, '', 0),
(98, 78, 'kk', '', 30, '2024-08-09 01:10:04', 'read', 0, '', 0),
(99, 78, 'k', '', 30, '2024-08-09 01:10:11', 'read', 0, '', 0),
(100, 78, '}', '', 30, '2024-08-09 01:10:13', 'read', 0, '', 0),
(101, 78, 'lmj', '', 30, '2024-08-09 01:10:17', 'read', 0, '', 0),
(102, 79, 'd', '', 1, '2024-08-09 02:39:53', 'read', 0, '', 0),
(103, 79, 'fdf', '', 1, '2024-08-09 02:40:02', 'read', 0, '', 0),
(104, 79, 'dff4', '', 1, '2024-08-09 02:40:03', 'read', 0, '', 0),
(105, 79, 'Reporte finalizado', '', 1, '2024-08-09 02:40:10', 'read', 1, '', 1),
(106, 79, 'Área seleccionada: Problemas con mi pago', '', 1, '2024-08-09 02:40:12', 'read', 0, '', 0),
(107, 80, 'fd', '', 1, '2024-08-09 02:40:14', 'read', 0, '', 0),
(108, 80, 'fd', '', 1, '2024-08-09 02:40:15', 'read', 0, '', 0),
(109, 78, 'j', '', 30, '2024-08-09 03:06:09', 'read', 0, '', 0),
(110, 78, 'bn {}', '', 30, '2024-08-09 03:06:34', 'read', 0, '', 0),
(111, 78, 'nj', '', 30, '2024-08-09 03:06:53', 'read', 0, '', 0),
(112, 78, 'cxc', '', 30, '2024-08-09 03:07:09', 'read', 0, '', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(255) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `servicio` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `perfiles` varchar(11) NOT NULL,
  `pin` int(11) NOT NULL,
  `problema` varchar(255) NOT NULL,
  `Fecha_de_ingreso` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `created_at`) VALUES
(1, 'Prueba', 'Pruebas@gmail.com', '2024-07-31 19:25:20'),
(30, 'Juan', 'juan@gmail.com', '2024-08-01 21:43:09'),
(31, 'Jaime', 'jaime@ucol.mx', '2024-08-03 06:56:27');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_area_id` (`area_id`);

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indices de la tabla `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_id` (`chat_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT de la tabla `message`
--
ALTER TABLE `message`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=354;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `fk_area_id` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`);

--
-- Filtros para la tabla `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`);

--
-- Filtros para la tabla `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`),
  ADD CONSTRAINT `message_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
