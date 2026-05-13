const express = require("express");
const router = express.Router();

const {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require("../controllers/categorias.controller");

const {
  verificarToken,
  soloEmpresa
} = require("../middlewares/auth.middleware");

router.get("/", obtenerCategorias);
router.get("/:id", obtenerCategoriaPorId);

router.post("/", verificarToken, soloEmpresa, crearCategoria);
router.put("/:id", verificarToken, soloEmpresa, actualizarCategoria);
router.delete("/:id", verificarToken, soloEmpresa, eliminarCategoria);

module.exports = router;