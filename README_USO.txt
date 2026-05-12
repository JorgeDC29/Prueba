# Como usar este proyecto

Esta version usa la estructura completa:

- frontend: contiene la pagina real que ya tenias.
- backend: contiene una base en Node.js y Express para conectar despues con MySQL.
- database: contiene el archivo SQL para crear las tablas.

## Abrir la pagina actual

Entra a:

frontend/index.html

Ese archivo carga:

- css/estilos.css
- js/usuarios.js
- js/app.js

## Cuentas de prueba del frontend

Usuario:
correo: usuario@gmail.com
contrasena: 1234

Empresa:
correo: empresa@gmail.com
contrasena: 1234

Empresa 2:
correo: smartoffice@gmail.com
contrasena: 1234

## Importante

El frontend actual sigue usando localStorage y usuarios.js para funcionar sin servidor.

El backend y la base de datos estan preparados como guia para cuando quieras pasar el sistema a MySQL real.

Para hacerlo 100% real despues, habria que cambiar app.js para que en vez de usar localStorage consulte al backend mediante fetch().
