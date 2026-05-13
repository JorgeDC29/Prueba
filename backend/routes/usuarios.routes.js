const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  desactivarUsuario
} = require("../controllers/usuarios.controller");

const {
  verificarToken
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, obtenerUsuarios);
router.get("/:id", verificarToken, obtenerUsuarioPorId);
router.put("/:id", verificarToken, actualizarUsuario);
router.delete("/:id", verificarToken, desactivarUsuario);

module.exports = router;