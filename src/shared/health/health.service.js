const getHealthStatus = () => {
  return {
    status: "ok",
    service: "petcare-back",
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  getHealthStatus,
};
