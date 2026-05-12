const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensaje: "Token no enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token invalido" });
  }
}

function soloEmpresa(req, res, next) {
  if (req.usuario.tipo_cuenta !== "empresa") {
    return res.status(403).json({ mensaje: "Solo empresas pueden hacer esta accion" });
  }

  next();
}

module.exports = {
  verificarToken,
  soloEmpresa
};
