const jwt = require("jsonwebtoken");
const Roles = require("./roles");

// Secret key for signing the token (in production, store this securely, e.g., in environment variables)
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a token for a user
const generateToken = (user) => {
  // Payload will contain user information, typically the user ID and role
  const payload = {
    id: user._id, // MongoDB ObjectId of the user
    role: user.role, // 'admin', 'wholesaler', 'retailer', 'delivery'
  };
  // Generate a signed JWT token with the payload and secret
  return jwt.sign(payload, JWT_SECRET);
};

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  // Token is typically sent in the Authorization header (e.g., 'Bearer <token>')
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(200)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    // Verify the token and attach the payload to the request object
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded user information (e.g., id, role)
    next(); // Pass to the next middleware/route handler
  } catch (error) {
    console.error(error);
    return res.status(200).json({ success: false, message: "Invalid token" });
  }
};

const verifyRole = (req, res, next) => {
  const { role } = req.user;

  if (role === Roles.DELIVERY_PARTNER || role === Roles.RETAILER) {
    return res
      .status(200)
      .json({ success: false, message: "This role cannot add a product" });
  }

  next();
};

const verifyAdmin = async (req, res, next) => {
  const { role } = req.user;

  if (role === Roles.ADMIN) {
    next();
  } else {
    return res
      .status(200)
      .json({ success: false, message: "This role cannot request this" });
  }
};

module.exports = { generateToken, verifyToken, verifyRole, verifyAdmin };
