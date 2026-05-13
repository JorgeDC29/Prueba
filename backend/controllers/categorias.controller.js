const pool = require("../database/conexion");

async function obtenerCategorias(req, res) {
  try {
    const [categorias] = await pool.query(
      "SELECT * FROM categorias ORDER BY nombre_categoria ASC"
    );

    res.json(categorias);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener categorias"
    });
  }
}

async function obtenerCategoriaPorId(req, res) {
  try {
    const { id } = req.params;

    const [categorias] = await pool.query(
      "SELECT * FROM categorias WHERE id_categoria = ?",
      [id]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensaje: "Categoria no encontrada"
      });
    }

    res.json(categorias[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener categoria"
    });
  }
}

async function crearCategoria(req, res) {
  try {
    const { nombre_categoria } = req.body;

    if (!nombre_categoria) {
      return res.status(400).json({
        mensaje: "El nombre de la categoria es obligatorio"
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO categorias (nombre_categoria) VALUES (?)",
      [nombre_categoria]
    );

    res.status(201).json({
      mensaje: "Categoria creada correctamente",
      id_categoria: resultado.insertId
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear categoria"
    });
  }
}

async function actualizarCategoria(req, res) {
  try {
    const { id } = req.params;
    const { nombre_categoria } = req.body;

    if (!nombre_categoria) {
      return res.status(400).json({
        mensaje: "El nombre de la categoria es obligatorio"
      });
    }

    const [resultado] = await pool.query(
      "UPDATE categorias SET nombre_categoria = ? WHERE id_categoria = ?",
      [nombre_categoria, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Categoria no encontrada"
      });
    }

    res.json({
      mensaje: "Categoria actualizada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar categoria"
    });
  }
}

async function eliminarCategoria(req, res) {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(
      "SELECT id_producto FROM productos WHERE id_categoria = ? AND estado = 'activo'",
      [id]
    );

    if (productos.length > 0) {
      return res.status(400).json({
        mensaje: "No puedes eliminar una categoria con productos activos"
      });
    }

    const [resultado] = await pool.query(
      "DELETE FROM categorias WHERE id_categoria = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Categoria no encontrada"
      });
    }

    res.json({
      mensaje: "Categoria eliminada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar categoria"
    });
  }
}

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};