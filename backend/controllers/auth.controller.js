const jwt = require("jsonwebtoken");
const pool = require("../database/conexion");
const { crearHash, compararHash } = require("../utils/hash");

async function login(req, res) {
  try {
    const { correo, contrasena, tipo_cuenta } = req.body;

    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ? AND tipo_cuenta = ?",
      [correo, tipo_cuenta]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: "Cuenta no encontrada" });
    }

    const usuario = usuarios[0];
    const contrasenaValida = await compararHash(contrasena, usuario.contrasena_hash);

    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: "Contrasena incorrecta" });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        tipo_cuenta: usuario.tipo_cuenta
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Sesion iniciada",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo_cuenta: usuario.tipo_cuenta
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en login" });
  }
}

async function registrar(req, res) {
  try {
    const { nombre, correo, contrasena, tipo_cuenta } = req.body;
    const contrasena_hash = await crearHash(contrasena);

    await pool.query(
      "INSERT INTO usuarios (nombre, correo, contrasena_hash, tipo_cuenta) VALUES (?, ?, ?, ?)",
      [nombre, correo, contrasena_hash, tipo_cuenta]
    );

    res.status(201).json({ mensaje: "Usuario registrado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
}

module.exports = {
  login,
  registrar
};
