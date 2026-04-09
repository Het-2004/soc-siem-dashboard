const User = require("../models/User");
const jwt  = require("jsonwebtoken");

/* ── Token helpers ──────────────────────────────────────────── */
const issueAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );

const issueRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

/* ── Register ───────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ name, email, password, role: role || "ANALYST" });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Login ──────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken  = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user);

    // Persist refresh token (hashed would be better for production — keep as-is for clarity)
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Refresh ─────────────────────────────────────────────────
   POST /api/auth/refresh
   Body: { refreshToken }
   Returns: { accessToken }
*/
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify JWT signature
    let payload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Check it matches what's stored in DB
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const accessToken = issueAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Logout ──────────────────────────────────────────────────
   POST /api/auth/logout
   Requires auth middleware. Clears the refresh token from DB.
*/
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Get Profile ─────────────────────────────────────────── */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Update Profile ─────────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    // Note: password NOT allowed here — prevents accidental double-hash
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
