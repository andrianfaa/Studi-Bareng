import type { Request, Response } from "express";
import { ApiError } from "../classes";
import {
    authenticateUser,
    getUserProfile,
    signUp as signUpService
} from "../services/user.services";

export const signUp = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.sendResponse("error", 400, {
                message: "Name, email, and password are required"
            });
        }

        // Call the service to sign up the user
        const token = await signUpService({
            name,
            email,
            password
        });

        // Respond with the token
        return res.sendResponse("success", 201, {
            message: "User signed up successfully",
            data: {
                token
            }
        });
    } catch (error) {
        // Handle errors from the service
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode || 500, {
                message: error.message
            });
        }

        // Fallback for unexpected errors
        return res.sendResponse("error", 500, {
            message: "Internal server error"
        });
    }
};

export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.sendResponse("error", 400, {
                message: "Email and password are required"
            });
        }

        const token = await authenticateUser(email, password);

        // Respond with the token
        return res.sendResponse("success", 200, {
            message: "User authenticated successfully",
            data: {
                token
            }
        });
    } catch (error) {
        // Handle errors from the service
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode || 500, {
                message: error.message
            });
        }

        // Fallback for unexpected errors
        return res.sendResponse("error", 500, {
            message: "Internal server error"
        });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        // Check if user is authenticated
        if (!user) {
            return res.sendResponse("error", 401, {
                message: "Unauthorized"
            });
        }

        const userProfile = await getUserProfile(user.id);

        // Respond with the user profile
        return res.sendResponse("success", 200, {
            message: "User profile retrieved successfully",
            data: userProfile
        });
    } catch (error) {
        // Handle errors from the service
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode || 500, {
                message: error.message
            });
        }

        // Fallback for unexpected errors
        return res.sendResponse("error", 500, {
            message: "Internal server error"
        });
    }
};
