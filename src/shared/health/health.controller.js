const { getHealthStatus } = require("./health.service");

const healthController = (_req, res) => {
  const data = getHealthStatus();
  res.status(200).json(data);
};

module.exports = {
  healthController,
};
