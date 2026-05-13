const express = require("express");
const router = express.Router();

const {
  obtenerEmpresas,
  obtenerEmpresaPorId,
  obtenerProductosDeEmpresa,
  crearEmpresa,
  actualizarEmpresa
} = require("../controllers/empresas.controller");

const {
  verificarToken,
  soloEmpresa
} = require("../middlewares/auth.middleware");

router.get("/", obtenerEmpresas);
router.get("/:id", obtenerEmpresaPorId);
router.get("/:id/productos", obtenerProductosDeEmpresa);

router.post("/", verificarToken, soloEmpresa, crearEmpresa);
router.put("/:id", verificarToken, soloEmpresa, actualizarEmpresa);

module.exports = router;