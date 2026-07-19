const multer = require("multer");
module.exports = (error, req, res, next) => {
  if (error instanceof multer.MulterError) return res.status(400).json({ error: error.message });
  if (error.code === "P2002") return res.status(409).json({ error: "Ya existe un registro con esos datos." });
  if (error.code === "P2025") return res.status(404).json({ error: "Recurso no encontrado." });
  console.error(error);
  return res.status(error.status || 500).json({ error: error.message || "Error interno del servidor." });
};
