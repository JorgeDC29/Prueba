const bcrypt = require("bcrypt");

async function crearHash(contrasena) {
  const saltRounds = 10;
  return bcrypt.hash(contrasena, saltRounds);
}

async function compararHash(contrasena, hashGuardado) {
  return bcrypt.compare(contrasena, hashGuardado);
}

module.exports = {
  crearHash,
  compararHash
};