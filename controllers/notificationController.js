const Notification = require("../models/Nodtification");
const User = require("../models/User");

const getNotifications = async (req, res) => {
  const { id } = req.user;
  try {
    const userNotification = await User.findById(id, {
      notifications: 1,
    }).populate("notifications");
    return res
      .status(200)
      .json({ success: true, notifactions: userNotification.notifications });
  } catch (error) {
    return res.status(200).json({ success: true, message: error.message });
  }
};

const deleteNotifications = async (req, res) => {
  const { id } = req.user;
  const { notification_id } = req.body;
  try {
    await User.findByIdAndUpdate(id, {
      $pull: { notifications: notification_id },
    });
    await Notification.findByIdAndDelete(notification_id);
    return res.status(200).json({
      success: true,
      message: "Notification Deleted successfully",
    });
  } catch (error) {
    return res.status(200).json({ success: true, message: error.message });
  }
};

const saveAndPushNotification = async (user_id, title, body) => {
  const notification = new Notification({
    user_id,
    Notification_title: title,
    Notification_body: body,
  });

  await notification.save();

  await User.findByIdAndUpdate(user_id, {
    $push: { notifications: notification._id },
  });
};

module.exports = {
  getNotifications,
  deleteNotifications,
  saveAndPushNotification,
};
