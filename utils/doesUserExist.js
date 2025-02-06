const User = require("../models/User");
const Roles = require("./roles");

const checkSchema = async (mobileNumber) => {
  const obj = await User.findOne({ mobileNumber });

  if (obj) return obj.toObject();
  return undefined;
};
const doesUserExist = async (mobileNumber, role) => {
  const user = await checkSchema(mobileNumber, User);
  if (role === "website") {
    if (user && (user.role === Roles.ADMIN || user.role === Roles.WHOLESALER)) {
      return true;
    }
  } else {
    if (
      user &&
      (user.role === Roles.RETAILER || user.role === Roles.WHOLESALER)
    ) {
      return true;
    }
  }

  return false;
};

module.exports = { doesUserExist };
