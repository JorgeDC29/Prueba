const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios,
  obtenerUsuarioPorId
} = require("../controllers/usuarios.controller");

router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);

module.exports = router;
