const pool = require("../database/conexion");

async function obtenerEmpresas(req, res) {
  try {
    const [empresas] = await pool.query(
      `SELECT 
        empresas.id_empresa,
        empresas.id_usuario,
        empresas.nombre_empresa,
        empresas.descripcion,
        empresas.logo,
        empresas.telefono,
        empresas.direccion,
        usuarios.correo,
        usuarios.estado
      FROM empresas
      INNER JOIN usuarios ON empresas.id_usuario = usuarios.id_usuario
      WHERE usuarios.estado = 'activo'
      ORDER BY empresas.nombre_empresa ASC`
    );

    res.json(empresas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empresas"
    });
  }
}

async function obtenerEmpresaPorId(req, res) {
  try {
    const { id } = req.params;

    const [empresas] = await pool.query(
      `SELECT 
        empresas.id_empresa,
        empresas.id_usuario,
        empresas.nombre_empresa,
        empresas.descripcion,
        empresas.logo,
        empresas.telefono,
        empresas.direccion,
        usuarios.correo,
        usuarios.estado
      FROM empresas
      INNER JOIN usuarios ON empresas.id_usuario = usuarios.id_usuario
      WHERE empresas.id_empresa = ? AND usuarios.estado = 'activo'`,
      [id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json(empresas[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empresa"
    });
  }
}

async function obtenerProductosDeEmpresa(req, res) {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(
      `SELECT 
        productos.id_producto,
        productos.id_empresa,
        productos.id_categoria,
        productos.nombre,
        productos.descripcion,
        productos.precio,
        productos.imagen,
        productos.estrellas,
        productos.stock,
        productos.fecha_publicacion,
        productos.estado,
        categorias.nombre_categoria
      FROM productos
      LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
      WHERE productos.id_empresa = ? AND productos.estado = 'activo'
      ORDER BY productos.fecha_publicacion DESC`,
      [id]
    );

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos de la empresa"
    });
  }
}

async function crearEmpresa(req, res) {
  try {
    const {
      id_usuario,
      nombre_empresa,
      descripcion,
      logo,
      telefono,
      direccion
    } = req.body;

    if (!id_usuario || !nombre_empresa) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios"
      });
    }

    const [usuario] = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = ? AND tipo_cuenta = 'empresa' AND estado = 'activo'",
      [id_usuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: "No existe una cuenta de empresa valida para este usuario"
      });
    }

    const [empresaExistente] = await pool.query(
      "SELECT id_empresa FROM empresas WHERE id_usuario = ?",
      [id_usuario]
    );

    if (empresaExistente.length > 0) {
      return res.status(409).json({
        mensaje: "Este usuario ya tiene una empresa registrada"
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO empresas 
      (id_usuario, nombre_empresa, descripcion, logo, telefono, direccion)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nombre_empresa,
        descripcion || "",
        logo || null,
        telefono || null,
        direccion || null
      ]
    );

    res.status(201).json({
      mensaje: "Empresa creada correctamente",
      id_empresa: resultado.insertId
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear empresa"
    });
  }
}

async function actualizarEmpresa(req, res) {
  try {
    const { id } = req.params;

    const {
      nombre_empresa,
      descripcion,
      logo,
      telefono,
      direccion
    } = req.body;

    if (!nombre_empresa) {
      return res.status(400).json({
        mensaje: "El nombre de la empresa es obligatorio"
      });
    }

    const [resultado] = await pool.query(
      `UPDATE empresas
      SET nombre_empresa = ?,
          descripcion = ?,
          logo = ?,
          telefono = ?,
          direccion = ?
      WHERE id_empresa = ?`,
      [
        nombre_empresa,
        descripcion || "",
        logo || null,
        telefono || null,
        direccion || null,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json({
      mensaje: "Empresa actualizada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar empresa"
    });
  }
}

module.exports = {
  obtenerEmpresas,
  obtenerEmpresaPorId,
  obtenerProductosDeEmpresa,
  crearEmpresa,
  actualizarEmpresa
};