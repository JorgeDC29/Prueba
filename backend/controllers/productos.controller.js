const pool = require("../database/conexion");

async function obtenerProductos(req, res) {
  try {
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
        empresas.nombre_empresa,
        categorias.nombre_categoria
      FROM productos
      LEFT JOIN empresas ON productos.id_empresa = empresas.id_empresa
      LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
      WHERE productos.estado = 'activo'
      ORDER BY productos.fecha_publicacion DESC`
    );

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos"
    });
  }
}

async function obtenerProductoPorId(req, res) {
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
        empresas.nombre_empresa,
        categorias.nombre_categoria
      FROM productos
      LEFT JOIN empresas ON productos.id_empresa = empresas.id_empresa
      LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
      WHERE productos.id_producto = ? AND productos.estado = 'activo'`,
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.json(productos[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener producto"
    });
  }
}

async function crearProducto(req, res) {
  try {
    const id_empresa = req.usuario.id_empresa;

    const {
      id_categoria,
      nombre,
      descripcion,
      precio,
      imagen,
      estrellas,
      stock
    } = req.body;

    if (!id_empresa) {
      return res.status(403).json({
        mensaje: "La cuenta de empresa no tiene empresa asociada"
      });
    }

    if (!nombre || !precio) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios"
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO productos 
      (id_empresa, id_categoria, nombre, descripcion, precio, imagen, estrellas, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_empresa,
        id_categoria || null,
        nombre,
        descripcion || "",
        precio,
        imagen || null,
        estrellas || 3,
        stock || 0
      ]
    );

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id_producto: resultado.insertId
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear producto"
    });
  }
}

async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const id_empresa = req.usuario.id_empresa;

    const {
      id_categoria,
      nombre,
      descripcion,
      precio,
      imagen,
      estrellas,
      stock
    } = req.body;

    if (!id_empresa) {
      return res.status(403).json({
        mensaje: "La cuenta de empresa no tiene empresa asociada"
      });
    }

    if (!nombre || !precio) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios"
      });
    }

    const [resultado] = await pool.query(
      `UPDATE productos
      SET id_categoria = ?,
          nombre = ?,
          descripcion = ?,
          precio = ?,
          imagen = ?,
          estrellas = ?,
          stock = ?
      WHERE id_producto = ? AND id_empresa = ?`,
      [
        id_categoria || null,
        nombre,
        descripcion || "",
        precio,
        imagen || null,
        estrellas || 3,
        stock || 0,
        id,
        id_empresa
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado o no pertenece a tu empresa"
      });
    }

    res.json({
      mensaje: "Producto actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar producto"
    });
  }
}

async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;
    const id_empresa = req.usuario.id_empresa;

    if (!id_empresa) {
      return res.status(403).json({
        mensaje: "La cuenta de empresa no tiene empresa asociada"
      });
    }

    const [resultado] = await pool.query(
      "UPDATE productos SET estado = 'inactivo' WHERE id_producto = ? AND id_empresa = ?",
      [id, id_empresa]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado o no pertenece a tu empresa"
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar producto"
    });
  }
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
