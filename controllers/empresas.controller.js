const pool = require("../database/conexion");

async function obtenerEmpresas(req, res) {
  try {
    const [empresas] = await pool.query("SELECT * FROM empresas");
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener empresas" });
  }
}

async function obtenerEmpresaPorId(req, res) {
  try {
    const { id } = req.params;

    const [empresas] = await pool.query(
      "SELECT * FROM empresas WHERE id_empresa = ?",
      [id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ mensaje: "Empresa no encontrada" });
    }

    res.json(empresas[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener empresa" });
  }
}

module.exports = {
  obtenerEmpresas,
  obtenerEmpresaPorId
};
