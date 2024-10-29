const { default: mongoose } = require("mongoose");
const Admin = require("../models/Admin");
const User = require("../models/User");

const checkSchema = (mobileNumber, mongoSchema) => {
  return mongoSchema
    .findOne({ mobileNumber })
    .then((user) => {
      if (user) {
        return true;
      }
      return false;
    })
    .catch((err) => {
      throw err;
    });
};
const doesAdminExist = (mobileNumber) => {
  return checkSchema(mobileNumber, Admin);
};
const doesUserExist = (mobileNumber) => {
  return checkSchema(mobileNumber, User);
};

module.exports = { doesAdminExist, doesUserExist };
