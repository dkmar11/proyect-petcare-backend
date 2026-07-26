function createMapUrl(address, latitude, longitude) {
  const query = latitude != null && longitude != null ? `${latitude},${longitude}` : address;
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}
module.exports = { createMapUrl };
