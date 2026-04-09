const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile
} = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth.middleware");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validate
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    validate
  ],
  login
);

// Refresh — requires refreshToken in body, no JWT auth needed
router.post("/refresh", refresh);

// Logout — requires valid accessToken
router.post("/logout", auth, logout);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
