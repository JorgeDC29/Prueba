const pool = require("../database/conexion");

async function obtenerUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id_usuario,
        nombre,
        correo,
        tipo_cuenta,
        fecha_registro,
        estado
      FROM usuarios
      ORDER BY fecha_registro DESC`
    );

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener usuarios"
    });
  }
}

async function obtenerUsuarioPorId(req, res) {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      `SELECT 
        id_usuario,
        nombre,
        correo,
        tipo_cuenta,
        fecha_registro,
        estado
      FROM usuarios
      WHERE id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener usuario"
    });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios"
      });
    }

    const [resultado] = await pool.query(
      `UPDATE usuarios
      SET nombre = ?,
          correo = ?
      WHERE id_usuario = ?`,
      [nombre, correo, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Usuario actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar usuario"
    });
  }
}

async function desactivarUsuario(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE usuarios SET estado = 'inactivo' WHERE id_usuario = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Usuario desactivado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al desactivar usuario"
    });
  }
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  desactivarUsuario
};