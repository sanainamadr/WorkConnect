import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../config/token.js"
import jwt from "jsonwebtoken";




export  const signUp=async (req,res)=>{
    try {
      const {firstName,lastName,email,password,userName,role,workerType,city,phoneNumber}=req.body
      console.log("✅ Register route hit");
      console.log("Incoming registration data:", req.body);
    if(!firstName || !lastName || !email || !password || !userName || !role){
        return res.status(400).json({message:"send all details"})
    }

    // Validate role-specific fields
    if (role === "worker") {
      if (!workerType || !city || !phoneNumber) {
        return res.status(400).json({message:"Worker type, city, and phone number are required for workers"})
      }
    } else if (role === "employer") {
      if (!city) {
        return res.status(400).json({message:"City is required for employers"})
      }
    }

      let existUser=await User.findOne({email:email})
      if(existUser){
        return res.status(400).json({message:"User already exist"})
      }

      // Check if phone number already exists (for workers)
      if (role === "worker" && phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
          return res.status(400).json({message:"Phone number already registered"})
        }
      }

      if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is required and must be a string" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user object
    const userData = {
        firstName,
        lastName,
        email,
        password:hashedPassword,
        userName,
        role
    };

    // Add role-specific fields
    if (role === "worker") {
      userData.workerType = workerType;
      userData.city = city;
      userData.phoneNumber = phoneNumber;
    } else if (role === "employer") {
      userData.city = city;
    }

      const user=await User.create(userData)
      

      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Build response user object
      const userResponse = { 
        id: user._id, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        role: user.role,
        availability: user.availability,
        avatarUrl: user.avatarUrl
      };

      // Add role-specific fields to response
      if (user.city) {
        userResponse.city = user.city;
      }
      
      if (role === "worker") {
        userResponse.workerType = user.workerType;
        userResponse.phoneNumber = user.phoneNumber;
      }

      return res.status(201).json({
        token,
        user: userResponse
      })
      

    
    } catch (error) {
      console.log("Error is:",error);
      return res.status(400).json({ message: error.message });
      
      
      
    }
}

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const user = await User.findOne({ email, role }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    user.password = undefined;

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      // Build response user object
      const userResponse = {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        userName: user.userName,
        profileName: user.profileName,
        availability: user.availability,
        avatarUrl: user.avatarUrl
      };

      // Add city to response if available
      if (user.city) {
        userResponse.city = user.city;
      }

      // Add worker-specific fields to response if role is worker
      if (user.role === "worker") {
        userResponse.workerType = user.workerType;
        userResponse.phoneNumber = user.phoneNumber;
      }

      res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({
        token,
        user: userResponse
      });
  } catch (error) {
    console.error('Login server error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


export const logout=async (req,res)=>{
  try {
    res.clearCookie("token")
    res.status(200).json({message:"User Logout"})
  } catch (error) {
    return res.status(400).json(error)
    
  }
}

// Verify token and return user
export const verify = async (req, res) => {
  try {
    // User is already attached by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch full user data
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build response user object
    const userResponse = {
      _id: user._id,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      userName: user.userName,
      profileName: user.profileName,
      availability: user.availability,
      avatarUrl: user.avatarUrl,
    };

    // Add city if available
    if (user.city) {
      userResponse.city = user.city;
    }

    // Add worker-specific fields if role is worker
    if (user.role === "worker") {
      userResponse.workerType = user.workerType;
      userResponse.phoneNumber = user.phoneNumber;
    }

    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


