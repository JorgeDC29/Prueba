# Guia de archivos

## frontend/index.html

Estructura visual principal de la pagina.

Aqui van:
- Login.
- Menu.
- Secciones principales.
- Contenedores donde JavaScript mostrara productos, mercados y favoritos.

## frontend/css/estilos.css

Diseno visual.

Aqui van:
- Colores.
- Tarjetas.
- Botones.
- Menu lateral.
- Responsive.
- Estilos del login.
- Estilos de productos.

## frontend/js/app.js

Logica del navegador.

Aqui va:
- Capturar formularios.
- Enviar datos al backend.
- Mostrar productos.
- Filtrar productos.
- Cambiar entre secciones.
- Guardar favoritos desde la interfaz.

## backend/server.js

Archivo principal del servidor.

Aqui va:
- Encender Express.
- Activar JSON.
- Activar CORS.
- Conectar rutas.
- Escuchar el puerto del servidor.

## backend/database/conexion.js

Conexion con MySQL.

Aqui va:
- Host.
- Usuario.
- Contrasena.
- Nombre de base de datos.
- Pool de conexiones.

## backend/routes

Las rutas son las direcciones que el frontend puede llamar.

Ejemplos:
- /api/auth/login
- /api/productos
- /api/empresas
- /api/favoritos

## backend/controllers

Los controladores tienen la logica.

Ejemplos:
- Validar login.
- Crear usuario.
- Crear producto.
- Eliminar producto.
- Buscar favoritos.

## backend/middlewares

Verificaciones antes de permitir acciones.

Ejemplos:
- Verificar si el usuario inicio sesion.
- Verificar si la cuenta es empresa.
- Verificar permisos.

## backend/utils

Funciones auxiliares.

Ejemplo:
- Crear hash de contrasena.
- Comparar contrasena escrita con la guardada.

## database/tienda_tech.sql

Archivo para crear tablas en MySQL.

Aqui van:
- Tabla usuarios.
- Tabla empresas.
- Tabla productos.
- Tabla categorias.
- Tabla favoritos.
