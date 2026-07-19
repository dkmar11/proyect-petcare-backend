const AppError = require("../domain/errors/app-error");
const { createMapUrl } = require("../infrastructure/maps/google-maps.service");
exports.link = (req, res) => { const { address, latitude, longitude } = req.query; const mapUrl = createMapUrl(address, latitude, longitude); if (!mapUrl) throw new AppError("Indica address o latitude/longitude."); res.json({ mapUrl, provider: "Google Maps" }); };
