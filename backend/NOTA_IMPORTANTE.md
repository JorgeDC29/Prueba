# Nota sobre el backend

Este backend queda como base para conectar luego el frontend con MySQL.

Actualmente el frontend aplicado funciona localmente con:
- usuarios.js
- localStorage

Para conectar con SQL realmente, despues se debe modificar frontend/js/app.js para llamar rutas como:

- POST /api/auth/login
- GET /api/productos
- POST /api/productos
- PUT /api/productos/:id
- DELETE /api/productos/:id

La estructura de rutas, controladores y conexion ya queda lista como guia.
