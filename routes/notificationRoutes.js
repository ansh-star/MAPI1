const express = require("express");
const {
  getNotifications,
  deleteNotifications,
} = require("../controllers/notificationController");
const router = express.Router();

router.get("", getNotifications);

router.delete("", deleteNotifications);

module.exports = router;
