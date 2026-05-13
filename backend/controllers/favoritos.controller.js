const pool = require("../database/conexion");

async function obtenerFavoritos(req, res) {
  try {
    const { id_usuario } = req.params;

    const [favoritos] = await pool.query(
      `SELECT 
        favoritos.id_favorito,
        favoritos.id_usuario,
        favoritos.id_producto,
        favoritos.fecha_guardado,
        productos.nombre,
        productos.descripcion,
        productos.precio,
        productos.imagen,
        productos.estrellas,
        productos.stock,
        productos.estado,
        empresas.nombre_empresa,
        categorias.nombre_categoria
      FROM favoritos
      INNER JOIN productos ON favoritos.id_producto = productos.id_producto
      LEFT JOIN empresas ON productos.id_empresa = empresas.id_empresa
      LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
      WHERE favoritos.id_usuario = ?
      AND productos.estado = 'activo'
      ORDER BY favoritos.fecha_guardado DESC`,
      [id_usuario]
    );

    res.json(favoritos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener favoritos"
    });
  }
}

async function agregarFavorito(req, res) {
  try {
    const { id_usuario, id_producto } = req.body;

    if (!id_usuario || !id_producto) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios"
      });
    }

    const [existente] = await pool.query(
      "SELECT id_favorito FROM favoritos WHERE id_usuario = ? AND id_producto = ?",
      [id_usuario, id_producto]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        mensaje: "Este producto ya esta en favoritos"
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO favoritos (id_usuario, id_producto) VALUES (?, ?)",
      [id_usuario, id_producto]
    );

    res.status(201).json({
      mensaje: "Producto agregado a favoritos",
      id_favorito: resultado.insertId
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar favorito"
    });
  }
}

async function eliminarFavorito(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "DELETE FROM favoritos WHERE id_favorito = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Favorito no encontrado"
      });
    }

    res.json({
      mensaje: "Favorito eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar favorito"
    });
  }
}

module.exports = {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
};