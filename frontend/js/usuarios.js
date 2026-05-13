const cuentasRegistradas = [
  {
    correo: 'usuario@gmail.com',
    contrasena: '1234',
    tipo: 'usuario',
    nombre: 'Usuario Demo'
  },
  {
    correo: 'empresa@gmail.com',
    contrasena: '1234',
    tipo: 'empresa',
    nombre: 'Tech Store Panama',
    marketId: 1
  },
  {
    correo: 'smartoffice@gmail.com',
    contrasena: '1234',
    tipo: 'empresa',
    nombre: 'Smart Office',
    marketId: 2
  }
];

function validarCuenta(correo, contrasena, tipo) {
  return cuentasRegistradas.find((cuenta) => {
    return cuenta.correo.toLowerCase() === correo.toLowerCase() &&
           cuenta.contrasena === contrasena &&
           cuenta.tipo === tipo;
  });
}
