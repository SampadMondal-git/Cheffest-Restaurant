import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import generateToken from "../utils/generatesToken.js";
import sendResetEmail from "../services/emailService.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  // logic of signup route
  try {
    const { name, email, phone, password, confirmPassword, role, position } = req.body;

    // Required fields validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Password Validation
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Email Validation
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Number Validation
    const numberRegex = /^\d{10}$/;
    if (!numberRegex.test(phone)) {
      return res.status(400).json({ message: "Number must be 10 digits" });
    }

    // User Validation (check by email or number)
    const user = await userModel.findOne({ $or: [{ email }, { phone }] });

    if (user) {
      return res.status(400).json({ message: "User already exists", exist: true, data: user });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User Creation
    const newUser = new userModel({ name, email: normalizedEmail, phone, password: hashedPassword, role, position });

    await newUser.save();

    // Create JWT token
    const token = generateToken(newUser, res);

    const safeUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      position: newUser.position,
      isFirstLogin: true,
    };

    return res.status(201).json({ message: "User created successfully", data: safeUser, token });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  // logic of login route
  try {
    const { identifier, password, rememberMe = false } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Please provide your email or number" });
    }

    if (identifier.includes("@")) {
      if (!validator.isEmail(identifier)) {
        return res.status(400).json({ message: "Enter a valid email" });
      }
    } else {
      // Otherwise treat as number
      const numberRegex = /^\d{10}$/;

      if (!numberRegex.test(identifier)) {
        return res.status(400).json({ message: "Number must be 10 digits" });
      }
    }

    if (!password) {
      return res.status(400).json({ message: "Please provide your password" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await userModel.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) {
      return res.status(401).json({ message: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (user.isFirstLogin) {
      await userModel.findByIdAndUpdate(user._id, {
        isFirstLogin: false
      });
    }

    // Create JWT token
    const token = generateToken(user, res, rememberMe);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      position: user.position,
      isFirstLogin: user.isFirstLogin,
    };

    return res.status(200).json({ message: "Login successful", data: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  // logic of logout route
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  // logic of forgot password route
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide your email" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 1800000; // 30 minutes

    await user.save();

    const resetPasswordUrl = `http://localhost:5173/reset-password/${token}`;

    await sendResetEmail(
      email,
      resetPasswordUrl,
      "Password Reset - Cheffest"
    );

    return res.status(200).json({ message: "Password reset email sent successfully", data: user, token });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const validateToken = async (req, res) => {
  // logic of reset password route
  try {
    const user = await userModel.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const resetPassword = async (req, res) => {
  // logic of reset password route
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getUserDetailsByToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    if (!req.user.userId) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findById(req.user.userId);

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserDetailsByToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    if (!req.user.userId) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.userId,
      { name, email, phone },
      { returnDocument: "after" }
    );

    res.status(200).json({ data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};