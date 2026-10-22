import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;

  
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailNormalized = email.toLowerCase().trim();
  const passwordTrimmed = password.trim();

  try {
    if (passwordTrimmed.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email: emailNormalized });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(passwordTrimmed, salt);

    const newUser = new User({
      email: emailNormalized,
      fullName: fullName.trim(),
      password: hashPassword,
    });
    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profilePicture: newUser.profilePicture,
          createdAt: newUser.createdAt,
        },
      });
    } else {
      return res.status(500).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const emailNormalized = email.toLowerCase().trim();
    const passwordTrimmed = password.trim();

    const user = await User.findOne({ email: emailNormalized });


    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(passwordTrimmed, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id, 
        fullName: user.fullName.trim(), 
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 0,
      path: "/",
    });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;
    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    if (profilePicture.length > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large" });
    }

    let uploadResponse;

    try {
      uploadResponse = await cloudinary.uploader.upload(profilePicture);
    } catch (err) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true },
    );
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName.trim(),
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in updateProfile controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("Error in checkAuth controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
