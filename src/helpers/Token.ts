import jwt from "jsonwebtoken";

export const generateToken = async (id: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return await jwt.sign({ userId: id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
}