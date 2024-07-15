-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 15-07-2024 a las 17:38:28
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
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `area_id`, `created_at`) VALUES
(1, 'Alberto', 'xd@ucol.mx', 1, '2024-07-07 21:02:02'),
(2, 'Hugo', 'hugo@ucol.mx', 2, '2024-07-07 21:02:02'),
(3, 'Hugox', 'hugox@ucol.mx', 2, '2024-07-07 21:02:02'),
(4, 'Moran', 'moran@ucol.mx', 1, '2024-07-07 21:02:02'),
(5, 'Danielitros', 'daniel@ucol.mx', 3, '2024-07-07 21:02:02'),
(6, 'Danielitrosx', 'danielx@ucol.mx', 3, '2024-07-07 21:02:02'),
(7, 'cristiano', 'cr7@gmail.mx', 4, '2024-07-15 00:46:15');

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
  `area_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `chats`
--

INSERT INTO `chats` (`id`, `user_id`, `area_id`, `created_at`, `updated_at`) VALUES
(273, 3, 1, '2024-07-15 04:54:27', '2024-07-15 04:54:27'),
(274, 1, 1, '2024-07-15 04:56:49', '2024-07-15 04:56:49'),
(275, 4, 2, '2024-07-15 05:56:13', '2024-07-15 17:19:32'),
(276, 5, 2, '2024-07-15 05:56:54', '2024-07-15 17:19:33'),
(277, 1, 3, '2024-07-15 06:56:58', '2024-07-15 06:56:58'),
(278, 5, 3, '2024-07-15 06:57:51', '2024-07-15 06:57:51'),
(279, 5, 1, '2024-07-15 08:41:31', '2024-07-15 08:41:31'),
(280, 6, 1, '2024-07-15 17:20:17', '2024-07-15 17:20:17'),
(281, 6, 3, '2024-07-15 17:20:33', '2024-07-15 17:20:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `message`
--

CREATE TABLE `message` (
  `id` int(20) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `owner_id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('unread','read') DEFAULT 'unread',
  `IsAdmin` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `message`
--

INSERT INTO `message` (`id`, `chat_id`, `text`, `owner_id`, `timestamp`, `status`, `IsAdmin`) VALUES
(1, 273, 'Problemas con mi cuenta beooo', 3, '2024-07-15 04:54:32', 'read', 0),
(2, 273, 'ddd', 3, '2024-07-15 04:54:43', 'read', 0),
(3, 273, 'd', 3, '2024-07-15 04:55:45', 'read', 0),
(4, 273, 'si', 1, '2024-07-15 04:55:52', 'read', 1),
(5, 274, 'Probdjedmedeed', 1, '2024-07-15 04:56:53', 'read', 0),
(6, 274, 'ss', 1, '2024-07-15 04:57:49', 'read', 0),
(7, 274, 'ddd', 1, '2024-07-15 04:57:54', 'read', 0),
(8, 273, 'ssss', 3, '2024-07-15 04:58:06', 'read', 0),
(9, 273, 'Problemas con mi cuenta', 3, '2024-07-15 05:43:54', 'read', 0),
(10, 273, 'd', 3, '2024-07-15 05:43:56', 'read', 0),
(11, 273, 'd', 3, '2024-07-15 05:43:58', 'read', 0),
(12, 273, 'd', 3, '2024-07-15 05:43:59', 'read', 0),
(13, 273, 'Problemas con mi cudenta', 3, '2024-07-15 05:44:06', 'read', 0),
(14, 273, 'd', 3, '2024-07-15 05:44:08', 'read', 0),
(15, 273, 'd', 3, '2024-07-15 05:44:09', 'read', 0),
(16, 273, 'Deberia desaparecer tu titulo', 4, '2024-07-15 05:44:21', 'read', 1),
(17, 273, 'd', 3, '2024-07-15 05:44:24', 'read', 0),
(18, 273, 'd', 3, '2024-07-15 05:44:25', 'read', 0),
(19, 273, 'd', 3, '2024-07-15 05:44:26', 'read', 0),
(20, 275, 'Reporte realizado con éxito:\nServicio: Max\nCorreo: hbomax22@gmail.com\nContraseña: preuba83\nPerfiles: P1\nPIN: 1040\nProblema: Cuenta caida, favor de arreglarlo', 4, '2024-07-15 05:56:13', 'read', 0),
(21, 275, 'j', 5, '2024-07-15 05:56:42', 'read', 1),
(22, 276, 'b', 5, '2024-07-15 05:57:12', 'read', 0),
(23, 276, 'Reporte realizado con éxito:\nServicio: Max\nCorreo: hbomax22@gmail.com\nContraseña: preuba83\nPerfiles: P1\nPIN: 1040\nProblema: Cuenta caida, favor de arreglarlo', 5, '2024-07-15 05:57:12', 'read', 0),
(24, 275, 's', 4, '2024-07-15 05:57:30', 'read', 0),
(25, 276, 'nn', 5, '2024-07-15 05:57:41', 'read', 0),
(26, 275, 'bb', 4, '2024-07-15 05:57:53', 'read', 0),
(27, 276, 'jjj', 5, '2024-07-15 05:58:17', 'read', 1),
(28, 276, 'mmmmm', 5, '2024-07-15 05:58:27', 'read', 1),
(29, 275, 'b', 4, '2024-07-15 05:58:55', 'read', 0),
(30, 276, 'b', 5, '2024-07-15 05:59:01', 'read', 1),
(31, 275, 'bb', 5, '2024-07-15 05:59:06', 'read', 1),
(32, 275, 'bb', 4, '2024-07-15 05:59:11', 'read', 0),
(33, 275, 'sss', 2, '2024-07-15 06:01:53', 'read', 1),
(34, 275, 'we', 2, '2024-07-15 06:02:01', 'read', 1),
(35, 275, 'jjj', 2, '2024-07-15 06:06:58', 'read', 1),
(36, 275, 'mmm', 2, '2024-07-15 06:07:12', 'read', 1),
(37, 275, '', 2, '2024-07-15 06:07:12', 'read', 1),
(38, 275, ',,,', 2, '2024-07-15 06:07:25', 'read', 1),
(39, 275, 'bbbbb', 4, '2024-07-15 06:07:30', 'unread', 0),
(40, 273, 'Problemas con mi cuenta', 3, '2024-07-15 06:09:06', 'read', 0),
(41, 273, 'd', 3, '2024-07-15 06:09:09', 'read', 0),
(42, 273, 'd', 4, '2024-07-15 06:09:14', 'read', 1),
(43, 273, 'd', 4, '2024-07-15 06:09:19', 'read', 1),
(44, 277, 'Reporte realizado con éxito:\nServicio: Max\nCorreo: hbomax22@gmail.com\nContraseña: preuba83\nPerfiles: P1\nPIN: 1040\nProblema: Cuenta caida, favor de arreglarlo', 1, '2024-07-15 06:56:58', 'read', 0),
(45, 277, 'w', 1, '2024-07-15 06:57:29', 'read', 0),
(46, 278, 'Problemas con la página web', 5, '2024-07-15 06:57:52', 'read', 0),
(47, 277, 'fff', 1, '2024-07-15 06:58:02', 'read', 0),
(48, 278, 'nn', 5, '2024-07-15 07:00:14', 'read', 1),
(49, 278, 'nn', 5, '2024-07-15 07:00:18', 'read', 0),
(50, 277, 'bb', 5, '2024-07-15 07:02:37', 'read', 1),
(51, 277, 'bbbjn', 5, '2024-07-15 07:06:12', 'read', 1),
(52, 278, 'bbbm ', 5, '2024-07-15 07:06:20', 'read', 1),
(53, 277, 'nn', 1, '2024-07-15 07:06:37', 'read', 0),
(54, 277, 'nn', 1, '2024-07-15 07:11:25', 'read', 0),
(55, 278, 'mmm', 5, '2024-07-15 07:11:32', 'read', 0),
(56, 277, 'sss', 1, '2024-07-15 07:12:29', 'read', 0),
(57, 278, 'fff', 5, '2024-07-15 07:12:33', 'read', 0),
(58, 277, 'Problemas con la página web', 1, '2024-07-15 07:21:09', 'read', 0),
(59, 277, 'dd', 1, '2024-07-15 07:21:19', 'read', 0),
(60, 277, 'milagro', 1, '2024-07-15 07:21:33', 'read', 0),
(61, 278, 'Problemas con la página web', 5, '2024-07-15 08:02:29', 'read', 0),
(62, 278, 's', 5, '2024-07-15 08:02:53', 'read', 0),
(63, 278, 'sss', 5, '2024-07-15 08:02:57', 'read', 0),
(64, 278, 'rrr', 5, '2024-07-15 08:03:09', 'read', 0),
(65, 278, 'fg', 5, '2024-07-15 08:03:21', 'read', 0),
(66, 277, 'ss', 5, '2024-07-15 08:03:24', 'read', 1),
(67, 278, 'd', 5, '2024-07-15 08:03:41', 'read', 0),
(68, 278, 'dd', 5, '2024-07-15 08:03:52', 'read', 1),
(69, 278, 'gggg', 5, '2024-07-15 08:03:58', 'read', 1),
(70, 279, 'Problemas con mi cuenta', 5, '2024-07-15 08:41:33', 'read', 0),
(71, 279, 'e', 5, '2024-07-15 08:42:13', 'unread', 0),
(72, 280, '', 6, '2024-07-15 17:20:27', 'unread', 0),
(73, 280, 'dfsdfs', 6, '2024-07-15 17:20:29', 'unread', 0),
(74, 280, 'Reporte realizado con éxito:\nServicio: Max\nCorreo: hbomax22@gmail.com\nContraseña: preuba83\nPerfiles: P1\nPIN: 1040\nProblema: Cuenta caida, favor de arreglarlo', 6, '2024-07-15 17:20:33', 'unread', 0);

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

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id`, `usuario`, `servicio`, `correo`, `contrasena`, `perfiles`, `pin`, `problema`, `Fecha_de_ingreso`) VALUES
(1, '3', 'Netflix', 'Netflix1@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:07:10'),
(2, '3', 'Netflix', 'Netflix1@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:07:57'),
(3, '3', 'Netflix', 'Netflix1@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:08:31'),
(4, '3', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:08:56'),
(5, '3', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:09:51'),
(6, '3', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:10:10'),
(7, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(8, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(9, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(10, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(11, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(12, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:16:27'),
(13, '1', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:18:26'),
(14, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:26:43'),
(15, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:36:41'),
(16, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:39:49'),
(17, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:40:25'),
(18, '4', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:46:10'),
(19, '1', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:48:41'),
(20, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:49:50'),
(21, '2', 'Netflix', 'Netflix05@gmail.com', 'preuba83', 'P4', 1040, 'Datos incorrectos', '2024-07-12 00:57:27'),
(22, '2', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:00:19'),
(23, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:03:28'),
(24, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:06:36'),
(25, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:08:36'),
(26, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:11:02'),
(27, '8', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:12:28'),
(28, '9', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 01:13:01'),
(29, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 18:55:39'),
(30, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 18:57:29'),
(31, '8', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:03:37'),
(32, '9', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:04:24'),
(33, '2', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:06:10'),
(34, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:07:05'),
(35, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:07:50'),
(36, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:07:52'),
(37, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:08:48'),
(38, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:41:25'),
(39, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:46:20'),
(40, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:49:47'),
(41, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:54:15'),
(42, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 19:54:50'),
(43, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 20:17:31'),
(44, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-12 20:17:39'),
(45, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 00:53:42'),
(46, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 06:41:50'),
(47, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 06:43:46'),
(48, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 22:54:51'),
(49, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 23:10:01'),
(50, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-13 23:33:26'),
(51, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 04:11:02'),
(52, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 04:22:02'),
(53, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 19:37:36'),
(54, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 22:26:56'),
(55, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 23:06:43'),
(56, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 23:08:24'),
(57, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-14 23:09:14'),
(58, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:24:30'),
(59, '3', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:24:39'),
(60, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:25:35'),
(61, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:27:08'),
(62, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:27:46'),
(63, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:29:02'),
(64, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:30:01'),
(65, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:30:46'),
(66, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:32:15'),
(67, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:32:29'),
(68, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:36:57'),
(69, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:37:04'),
(70, '9', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:38:31'),
(71, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:42:28'),
(72, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:42:34'),
(73, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:42:40'),
(74, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:43:08'),
(75, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:44:28'),
(76, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:48:17'),
(77, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:48:24'),
(78, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:48:26'),
(79, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:48:27'),
(80, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:48:32'),
(81, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:49:16'),
(82, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:49:28'),
(83, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:49:29'),
(84, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:49:30'),
(85, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:49:31'),
(86, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:51:00'),
(87, '2', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:51:52'),
(88, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:51:58'),
(89, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 02:55:44'),
(90, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 03:36:59'),
(91, '4', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 05:56:13'),
(92, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 05:56:54'),
(93, '5', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 05:57:11'),
(94, '1', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 06:56:58'),
(95, '6', 'Max', 'hbomax22@gmail.com', 'preuba83', 'P1', 1040, 'Cuenta caida, favor de arreglarlo', '2024-07-15 17:20:32');

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
(1, 'Pedro', 'pedro@ucol.mx', '2024-07-07 21:03:06'),
(2, 'Luis', 'luis@ucol.mx', '2024-07-07 21:03:24'),
(3, 'Maria', 'maria@example.com', '2024-07-07 21:04:54'),
(4, 'Juan', 'juan@example.com', '2024-07-07 21:04:54'),
(5, 'Ana', 'ana@example.com', '2024-07-07 21:04:54'),
(6, 'alb', 'alb@ucol.mx', '2024-07-12 00:35:51'),
(7, 'albb', 'albb2@ucol.mx', '2024-07-12 00:38:03'),
(8, 'alb2', 'albb3@ucol.mx', '2024-07-12 00:38:03'),
(9, 'alb3', 'albb4@ucol.mx', '2024-07-12 00:38:03'),
(10, 'Spiderman', 'spiderman@example.com', '2024-07-14 22:35:14');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=282;

--
-- AUTO_INCREMENT de la tabla `message`
--
ALTER TABLE `message`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
