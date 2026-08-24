import userModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import validator from "validator";

const normalizeUserRoleAndPosition = (role, position) => {
    const normalizedRole = role || "customer";

    if (normalizedRole !== "staff") {
        return {
            role: normalizedRole,
            position: undefined,
        };
    }

    if (!position) {
        return {
            role: normalizedRole,
            position: undefined,
            error: "A valid position is required for staff users",
        };
    }

    return {
        role: normalizedRole,
        position,
    };
};

export const createUser = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, role, position } = req.body;
        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email"
            });
        }

        if (!validator.isMobilePhone(phone, "en-IN")) {
            return res.status(400).json({
                message: "Invalid phone number"
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const { role: normalizedRole, position: normalizedPosition, error } = normalizeUserRoleAndPosition(role, position);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel({
            name,
            email,
            phone,
            password: hashedPassword,
            role: normalizedRole,
            position: normalizedPosition
        });

        await user.save();

        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const manageUser = async (req, res) => {
    try {
        const { role, position } = req.body;
        const { role: normalizedRole, position: normalizedPosition, error } = normalizeUserRoleAndPosition(role, position);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    role: normalizedRole,
                    position: normalizedPosition
                }
            },
            {
                new: true, runValidators: true
            }
        )

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {

        const user = await userModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};