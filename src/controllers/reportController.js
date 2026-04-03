// Dashboard reporting is disabled for users.
const getMyReport = async (req, res) =>
  res.status(403).json({ message: 'Reports are not available.' });

module.exports = { getMyReport };
