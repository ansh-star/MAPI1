const Location = require("../models/Location");

const getCities = async (req, res) => {
  try {
    const cities = await Location.find(
      { city: { $regex: `^${req.query.prefix}`, $options: "i" } },
      { city: 1, _id: 0 }
    )
      .hint({ city: 1 })
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
