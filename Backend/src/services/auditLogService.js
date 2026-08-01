const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  action,
  module,
  description,
  ipAddress
}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      module,
      description,
      ipAddress
    });

  } catch (error) {
    console.error(
      "Audit log creation failed:",
      error.message
    );
  }
};

module.exports = createAuditLog;