const jwt = require("jsonwebtoken");
const pool = require("../database/conexion");
const { crearHash, compararHash } = require("../utils/hash");

async function login(req, res) {
  try {
    const { correo, contrasena, tipo_cuenta } = req.body;

    if (!correo || !contrasena || !tipo_cuenta) {
      return res.status(400).json({
        mensaje: "Faltan datos"
      });
    }

    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE correo = ? AND tipo_cuenta = ? AND estado = 'activo'",
      [correo, tipo_cuenta]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o tipo de cuenta incorrecto"
      });
    }

    const usuario = usuarios[0];

    const contrasenaValida = await compararHash(
      contrasena,
      usuario.contrasena_hash
    );

    if (!contrasenaValida) {
      return res.status(401).json({
        mensaje: "Contrasena incorrecta"
      });
    }

    let empresa = null;

    if (usuario.tipo_cuenta === "empresa") {
      const [empresas] = await pool.query(
        "SELECT id_empresa, nombre_empresa FROM empresas WHERE id_usuario = ?",
        [usuario.id_usuario]
      );

      if (empresas.length > 0) {
        empresa = empresas[0];
      }
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        tipo_cuenta: usuario.tipo_cuenta,
        id_empresa: empresa ? empresa.id_empresa : null
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      mensaje: "Sesion iniciada correctamente",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo_cuenta: usuario.tipo_cuenta,
        id_empresa: empresa ? empresa.id_empresa : null,
        nombre_empresa: empresa ? empresa.nombre_empresa : null
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error en el login"
    });
  }
}

async function registrar(req, res) {
  try {
    const { nombre, correo, contrasena, tipo_cuenta } = req.body;

    if (!nombre || !correo || !contrasena || !tipo_cuenta) {
      return res.status(400).json({
        mensaje: "Faltan datos"
      });
    }

    if (tipo_cuenta !== "usuario" && tipo_cuenta !== "empresa") {
      return res.status(400).json({
        mensaje: "Tipo de cuenta invalido"
      });
    }

    const [existente] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        mensaje: "El correo ya esta registrado"
      });
    }

    const contrasena_hash = await crearHash(contrasena);

    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, correo, contrasena_hash, tipo_cuenta) VALUES (?, ?, ?, ?)",
      [nombre, correo, contrasena_hash, tipo_cuenta]
    );

    let id_empresa = null;

    if (tipo_cuenta === "empresa") {
      const [empresaCreada] = await pool.query(
        "INSERT INTO empresas (id_usuario, nombre_empresa, descripcion, logo, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)",
        [
          resultado.insertId,
          nombre,
          "Empresa registrada en Tienda Tech",
          null,
          null,
          null
        ]
      );

      id_empresa = empresaCreada.insertId;
    }

    res.status(201).json({
      mensaje: "Cuenta registrada correctamente",
      id_usuario: resultado.insertId,
      id_empresa
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar cuenta"
    });
  }
}

module.exports = {
  login,
  registrar
};
