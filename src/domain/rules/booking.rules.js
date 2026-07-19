const AppError = require("../errors/app-error");
const HOME_MODES = ["HOME_VISIT", "PICKUP_DROPOFF"];
const VACCINE_SERVICES = ["BOARDING", "VET"];

function validateBookingInput(input) {
  ["userId", "petId", "providerId", "serviceType", "serviceMode", "scheduledAt", "paymentMethod"].forEach((field) => {
    if (!input[field]) throw new AppError(`${field} es obligatorio.`);
  });
  if (!["ONLINE", "AT_LOCATION"].includes(input.paymentMethod)) throw new AppError("paymentMethod debe ser ONLINE o AT_LOCATION.");
}
function validateProviderCapability(provider, mode, address, latitude, longitude) {
  if (mode === "HOME_VISIT" && !provider.supportsHome) throw new AppError("Este proveedor no ofrece visitas a domicilio.");
  if (mode === "PICKUP_DROPOFF" && !provider.supportsPickup) throw new AppError("Este proveedor no ofrece recojo y entrega.");
  if (HOME_MODES.includes(mode) && !address && (latitude == null || longitude == null)) throw new AppError("Indica una dirección o coordenadas para el servicio a domicilio.");
}
module.exports = { validateBookingInput, validateProviderCapability, requiresVaccine: (service) => VACCINE_SERVICES.includes(service) };
