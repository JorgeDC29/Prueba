const pool = require("../database/conexion");

async function obtenerProductos(req, res) {
  try {
    const [productos] = await pool.query(
      `SELECT productos.*, empresas.nombre_empresa, categorias.nombre_categoria
       FROM productos
       LEFT JOIN empresas ON productos.id_empresa = empresas.id_empresa
       LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
       WHERE productos.estado = 'activo'`
    );

    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
}

async function crearProducto(req, res) {
  try {
    const {
      id_empresa,
      id_categoria,
      nombre,
      descripcion,
      precio,
      imagen,
      estrellas,
      stock
    } = req.body;

    await pool.query(
      `INSERT INTO productos
       (id_empresa, id_categoria, nombre, descripcion, precio, imagen, estrellas, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_empresa, id_categoria, nombre, descripcion, precio, imagen, estrellas, stock]
    );

    res.status(201).json({ mensaje: "Producto creado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto" });
  }
}

async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const {
      id_categoria,
      nombre,
      descripcion,
      precio,
      imagen,
      estrellas,
      stock
    } = req.body;

    await pool.query(
      `UPDATE productos
       SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, imagen = ?, estrellas = ?, stock = ?
       WHERE id_producto = ?`,
      [id_categoria, nombre, descripcion, precio, imagen, estrellas, stock, id]
    );

    res.json({ mensaje: "Producto actualizado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
}

async function eliminarProducto(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE productos SET estado = 'inactivo' WHERE id_producto = ?",
      [id]
    );

    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
}

module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
