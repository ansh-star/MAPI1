const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  Notification_title: { type: String, required: true },
  Notification_body: { type: String },
  Date: { type: Date, default: Date.now() },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
