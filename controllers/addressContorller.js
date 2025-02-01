const Address = require("../models/Address");
const User = require("../models/User");
const { saveAndPushNotification } = require("./notificationController");

const addUserAddress = async (req, res) => {
  const { id } = req.user;
  try {
    const addresses = await User.findById(id).select("addressList").lean();

    if (addresses.addressList.length >= 5) {
      return res
        .status(200)
        .json({ success: false, message: "You can add only 5 addresses" });
    }

    if (req.body.isDefault) {
      await Address.updateMany(
        { _id: { $in: addresses.addressList } },
        { isDefault: false }
      );
    }

    const newAddress = new Address({ ...req.body });

    const user = await User.findOneAndUpdate(
      { _id: id },
      { $push: { addressList: newAddress._id } },
      { new: true }
    );

    if (user.addressList.length === 1) {
      newAddress.isDefault = true;
    }

    await newAddress.save();

    saveAndPushNotification(id, "Address Added", "Address has been added");

    res.status(201).json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    return res
      .status(200)
      .json({ success: false, message: "Error adding address" });
  }
};
const updateUserAddress = async (req, res) => {
  const { id } = req.body;
  const { id: userId } = req.user;
  try {
    if (req.body.isDefault) {
      const addresses = await User.findById(userId)
        .select("addressList")
        .lean();
      await Address.updateMany(
        { _id: { $in: addresses.addressList } },
        { isDefault: false }
      );
    }
    const address = await Address.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (address) {
      saveAndPushNotification(
        userId,
        "Address Updated",
        "Address has been updated"
      );

      return res
        .status(200)
        .json({ success: true, message: "Address updated successfully" });
    }
    return res
      .status(200)
      .json({ success: false, message: "Address does not exist" });
  } catch (error) {
    res.status(200).json({ success: false, message: "Error updating address" });
  }
};
const deleteUserAddress = async (req, res) => {
  const { id } = req.user;
  try {
    const address = await Address.findByIdAndDelete(req.body.id, {
      new: true,
    });
    if (address) {
      const user = await User.findByIdAndUpdate(
        id,
        { $pull: { addressList: address._id } },
        { new: true }
      );
      if (address.isDefault && user.addressList.length > 0) {
        await Address.findByIdAndUpdate(user.addressList[0], {
          isDefault: true,
        });
      }
      saveAndPushNotification(
        id,
        "Address Deleted",
        "Address has been deleted"
      );
      return res
        .status(200)
        .json({ success: true, message: "Address deleted successfully" });
    }
    return res
      .status(200)
      .json({ success: false, message: "Address does not exist" });
  } catch (error) {
    res.status(200).json({ success: false, message: "Error deleting address" });
  }
};

const getUserAddress = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id)
      .select("addressList")
      .populate("addressList")
      .lean();
    if (user && user.addressList.length > 0) {
      return res.status(200).json({ success: true, user });
    } else if (user) {
      return res.status(200).json({ success: false, user });
    }
    return res.status(200).json({ success: false, message: "User not found" });
  } catch (error) {
    res.status(200).json({ success: false, message: "Error fetching address" });
  }
};
module.exports = {
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserAddress,
};
