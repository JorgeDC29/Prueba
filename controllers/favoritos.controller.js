const pool = require("../database/conexion");

async function obtenerFavoritos(req, res) {
  try {
    const { id_usuario } = req.params;

    const [favoritos] = await pool.query(
      `SELECT favoritos.id_favorito, productos.*
       FROM favoritos
       INNER JOIN productos ON favoritos.id_producto = productos.id_producto
       WHERE favoritos.id_usuario = ?`,
      [id_usuario]
    );

    res.json(favoritos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener favoritos" });
  }
}

async function agregarFavorito(req, res) {
  try {
    const { id_usuario, id_producto } = req.body;

    await pool.query(
      "INSERT INTO favoritos (id_usuario, id_producto) VALUES (?, ?)",
      [id_usuario, id_producto]
    );

    res.status(201).json({ mensaje: "Favorito agregado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar favorito" });
  }
}

async function eliminarFavorito(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM favoritos WHERE id_favorito = ?",
      [id]
    );

    res.json({ mensaje: "Favorito eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar favorito" });
  }
}

module.exports = {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
};
