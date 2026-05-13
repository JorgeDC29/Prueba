const express = require("express");
const router = express.Router();

const {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
} = require("../controllers/favoritos.controller");

const {
  verificarToken,
  soloUsuario
} = require("../middlewares/auth.middleware");

router.get("/:id_usuario", verificarToken, soloUsuario, obtenerFavoritos);
router.post("/", verificarToken, soloUsuario, agregarFavorito);
router.delete("/:id", verificarToken, soloUsuario, eliminarFavorito);

module.exports = router;