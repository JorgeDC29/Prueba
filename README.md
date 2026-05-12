# Tienda Tech

Estructura base guiada para un proyecto con muchos usuarios, empresas y productos.

## Partes principales

- frontend: interfaz que ve el usuario.
- backend: servidor que recibe peticiones y consulta la base de datos.
- database: archivos SQL para crear tablas.
- docs: explicacion de la estructura del proyecto.

## Flujo general

1. El usuario entra desde frontend/index.html.
2. frontend/js/app.js manda datos al backend.
3. backend/server.js recibe la peticion.
4. Las rutas mandan la peticion al controlador correcto.
5. El controlador usa database/conexion.js para consultar MySQL.
6. MySQL responde con usuarios, productos, favoritos, empresas, etc.

## Tecnologias pensadas

- HTML
- CSS
- JavaScript
- Node.js
- Express
- MySQL
- bcrypt
- dotenv
- cors
