const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require("../controllers/productos.controller");

const {
  verificarToken,
  soloEmpresa
} = require("../middlewares/auth.middleware");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);

router.post("/", verificarToken, soloEmpresa, crearProducto);
router.put("/:id", verificarToken, soloEmpresa, actualizarProducto);
router.delete("/:id", verificarToken, soloEmpresa, eliminarProducto);

module.exports = router;