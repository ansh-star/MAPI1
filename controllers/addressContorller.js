const Address = require("../models/Address");
const User = require("../models/User");

const addUserAddress = async (req, res) => {
  const { id } = req.user;
  try {
    if (req.body.isDefault) {
      const addresses = await User.findById(id).select("addressList").lean();
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

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    conso;
    res.status(200).json({ success: false, message: "Error adding address" });
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
    if (address)
      return res
        .status(200)
        .json({ success: true, message: "Address updated successfully" });
    return res
      .status(200)
      .json({ success: false, message: "Address does not exist" });
  } catch (error) {
    console.log(error);
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
    if (user) {
      return res.status(200).json({ success: true, user });
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