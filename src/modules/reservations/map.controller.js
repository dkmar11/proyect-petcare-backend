const AppError = require("../../shared/errors/app-error");
const { createMapUrl } = require("./infrastructure/google-maps.service");
exports.link = (req, res) => { const { address, latitude, longitude } = req.query; const mapUrl = createMapUrl(address, latitude, longitude); if (!mapUrl) throw new AppError("Indica address o latitude/longitude."); res.json({ mapUrl, provider: "Google Maps" }); };
