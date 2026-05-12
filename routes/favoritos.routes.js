const express = require("express");
const router = express.Router();

const {
  obtenerFavoritos,
  agregarFavorito,
  eliminarFavorito
} = require("../controllers/favoritos.controller");

router.get("/:id_usuario", obtenerFavoritos);
router.post("/", agregarFavorito);
router.delete("/:id", eliminarFavorito);

module.exports = router;
