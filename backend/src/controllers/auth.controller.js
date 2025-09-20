import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcrypt";
import cloudinary from '../lib/cloudinary.js'
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already Exist" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePicture: newUser.profilePicture,
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
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
  secure:true,
  sameSite:  "none" ,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path:"/"
    });

    return res.json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
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
    res.cookie("jwt","",{maxAge:0})
    return res.status(200).json({message:"Logged Out Successfully"})
  } catch (error) {
    console.log("Error in logout controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePicture} = req.body;
        const userId = req.user._id
        if(!profilePicture){
            return res.status(400).json({ message: "Profile picture is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePicture)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: uploadResponse.secure_url},
            {new: true}
        )
        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in updateProfile controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const checkAuth = (req, res) => {
    try {
       res.status(200).json(req.user) 
    } catch (error) {
        console.log("Error in checkAuth controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}