const AppError = require("../errors/app-error");
const HOME_MODES = ["HOME_VISIT", "PICKUP_DROPOFF"];
const VACCINE_SERVICES = ["BOARDING", "VET"];

function validateBookingInput(input) {
  if (!input.userId) throw new AppError("El ID del usuario es obligatorio.");
  if (!input.petId) throw new AppError("El ID de la mascota es obligatorio.");
  if (!input.providerId) throw new AppError("El ID del proveedor es obligatorio.");
  if (!input.serviceType) throw new AppError("El tipo de servicio es obligatorio.");
  if (!input.serviceMode) throw new AppError("El modo de servicio es obligatorio.");
  if (!input.scheduledAt) throw new AppError("La fecha y hora de la cita son obligatorias.");
  if (!input.paymentMethod) throw new AppError("El método de pago es obligatorio.");
  if (!["ONLINE", "AT_LOCATION"].includes(input.paymentMethod)) throw new AppError("El método de pago debe ser ONLINE o AT_LOCATION.");
}
function validateProviderCapability(provider, mode, address, latitude, longitude) {
  if (mode === "HOME_VISIT" && !provider.supportsHome) throw new AppError("Este proveedor no ofrece visitas a domicilio.");
  if (mode === "PICKUP_DROPOFF" && !provider.supportsPickup) throw new AppError("Este proveedor no ofrece recojo y entrega.");
  if (HOME_MODES.includes(mode) && !address && (latitude == null || longitude == null)) throw new AppError("Indica una dirección o coordenadas para el servicio a domicilio.");
}
module.exports = { validateBookingInput, validateProviderCapability, requiresVaccine: (service) => VACCINE_SERVICES.includes(service) };
