const Location = require("../models/Location");

const getCities = async (req, res) => {
  try {
    const prefix = req.query.prefix;

    if (!prefix) {
      return res
        .status(200)
        .json({ success: false, message: "Prefix is required" });
    }

    const cities = await Location.find(
      { city: { $regex: `^${prefix}`, $options: "i" } },
      { city: 1 }
    )
      .limit(10)
      .lean();

    return res.status(200).json({ success: true, cities });
  } catch (error) {
    console.error("Error getting cities:", error);
    return res
      .status(200)
      .json({ success: false, message: "Error getting cities" });
  }
};
module.exports = getCities;
