import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string): string => {
    // Define your secret key (use environment variables for security)
    const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

    // Generate token
    return jwt.sign(
        { id: userId }, // Payload (user id)
        SECRET_KEY,     // Secret key
        { expiresIn: "10d" } // Token expiration (e.g., 1 hour)
    );
};


export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
        return res.status(400).json({ message: "Every field is required", success: false });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", success: false });
        }

        // Generate JWT token
        const token = await generateToken(user._id);

        // Respond with user details and token
        return res
            .status(200)
            .cookie("accessToken", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            })
            .json({
                message: "User logged in successfully",
                success: true,
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    token: token, // Include JWT token here
                },
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { username, email, password } = req.body;
    try {
        if ([username, password, email].some((item) => !item || item.trim() === '')) {
            return res.status(400).json({ message: "every field is required", success: false })
        }

        const checkUser = await User.exists({
            $or: [{ username }, { email }]
        });

        if (checkUser) {
            return res.status(401).json({ message: "User already exists", success: true })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user: IUser = await User.create({
            email,
            username,
            password: hashedPassword,
        })

        if (user) {
            return res.status(201).json({ message: "User created successfully", success: true })
        } else {
            return res.status(400).json({ message: "User not created", success: false })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ messgae: "server error", success: false })
    }
}