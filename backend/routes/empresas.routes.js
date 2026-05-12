const express = require("express");
const router = express.Router();

const {
  obtenerEmpresas,
  obtenerEmpresaPorId
} = require("../controllers/empresas.controller");

router.get("/", obtenerEmpresas);
router.get("/:id", obtenerEmpresaPorId);

module.exports = router;
