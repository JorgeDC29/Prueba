const pool = require("../database/conexion");

async function obtenerCategorias(req, res) {
  try {
    const [categorias] = await pool.query("SELECT * FROM categorias");
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener categorias" });
  }
}

module.exports = {
  obtenerCategorias
};
