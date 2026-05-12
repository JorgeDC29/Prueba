const pool = require("../database/conexion");

async function obtenerUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(
      "SELECT id_usuario, nombre, correo, tipo_cuenta, fecha_registro, estado FROM usuarios"
    );

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
}

async function obtenerUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      "SELECT id_usuario, nombre, correo, tipo_cuenta, fecha_registro, estado FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuario" });
  }
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId
};
