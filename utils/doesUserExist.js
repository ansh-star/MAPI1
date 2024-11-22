const User = require("../models/User");
const Roles = require("./roles");

const checkSchema = async (mobileNumber) => {
  const obj = await User.findOne({ mobileNumber });

  if (obj) return obj.toObject();
  return undefined;
};
const doesAdminExist = async (mobileNumber) => {
  const admin = await checkSchema(mobileNumber);
  if (
    admin &&
    (admin.role === Roles.ADMIN || admin.role === Roles.WHOLESALER)
  ) {
    return true;
  }
  return false;
};
const doesUserExist = async (mobileNumber, role) => {
  const user = await checkSchema(mobileNumber, User);
  if (role) {
    if (user && (user.role === Roles.ADMIN || user.role === Roles.WHOLESALER)) {
      return true;
    }
  } else {
    if (
      user &&
      (user.role === Roles.RETAILER || user.role === Roles.DELIVERY_PARTNER)
    ) {
      return true;
    }
  }

  return false;
};

module.exports = { doesAdminExist, doesUserExist };
