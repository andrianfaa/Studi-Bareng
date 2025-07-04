import crypto from "node:crypto";
import { ApiError } from "../classes";
import { UserModel } from "../databases/models";
import { User } from "../databases/schemas/user.schema";
import { signJwt } from "../utils";

export type AuthenticatedUserResponse = {
    id: string;
    email: string;
    token: string;
};

type SignUp = {
    name: string;
    email: string;
    password: string;
};

type UserProfileResponse = {
    name: string;
    email: string;
};

/**
 * Authenticate a user by email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @return {Promise<string | null>} - Returns a JWT token if authentication is successful, otherwise throws an error.
 */
export const authenticateUser = async (
    email: string,
    password: string
): Promise<string | null> => {
    try {
        const user = await UserModel.findOne({
            email: email
        });

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const encryptedPassword = crypto
            .createHmac("sha256", process.env.PASSWORD_SECRET || "")
            .update(password)
            .digest("hex");

        if (user.password !== encryptedPassword) {
            throw new ApiError(401, "Invalid email or password");
        }

        const token = signJwt({
            id: user.id,
            email: user.email,
            token: crypto
                .createHash("sha256")
                .update(
                    JSON.stringify({
                        email: user.email,
                        password: user.password
                    }).trim()
                )
                .digest("hex")
        });

        if (!token) {
            throw new ApiError(500, "Failed to generate token");
        }

        return token;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw known ApiErrors
        }

        console.error("Error authenticating user:", error);
        throw new ApiError(500, "Internal server error");
    }
};

/**
 * Get a user by their ID.
 * @param {string} id - The user's ID.
 * @return {Promise<User>} - Returns the user object if found, otherwise throws an error.
 */
const getUserById = async (id: string): Promise<User> => {
    try {
        const user = await UserModel.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return user;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw known ApiErrors
        }

        throw new ApiError(500, "Internal server error");
    }
};

/**
 * Check if the provided token matches the expected token for the user.
 * @param {string} id - The user's ID.
 * @param {string} token - The token to check.
 * @return {Promise<boolean>} - Returns true if the token is valid, otherwise throws an error.
 */
export const checkToken = async (
    id: string,
    token: string
): Promise<boolean> => {
    try {
        const user = await getUserById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const expectedToken = crypto
            .createHmac("sha256", process.env.PASSWORD_SECRET || "")
            .update(
                JSON.stringify({
                    email: user.email,
                    password: user.password
                }).trim()
            )
            .digest("hex");

        if (expectedToken !== token) {
            throw new ApiError(401, "Invalid token");
        }

        return true;
    } catch (error) {
        console.error("Error checking token:", error);

        if (error instanceof ApiError) {
            throw error; // Re-throw known ApiErrors
        }

        throw new ApiError(500, "Internal server error");
    }
};

/**
 * Sign up a new user.
 * @param {SignUp} userData - The user's sign-up data.
 * @return {Promise<string>} - Returns a JWT token if sign-up is successful, otherwise throws an error.
 */
export const signUp = async ({
    name,
    email,
    password
}: SignUp): Promise<string> => {
    try {
        const existingUser = await UserModel.find({ email });

        if (existingUser.length > 0) {
            throw new ApiError(409, "User already exists");
        }

        const user = new UserModel({
            name,
            email,
            password
        });
        const savedUser = await user.save();

        if (!savedUser) {
            throw new ApiError(500, "Failed to create user");
        }

        const token = signJwt({
            id: savedUser.id,
            email: savedUser.email,
            token: crypto
                .createHmac("sha256", process.env.PASSWORD_SECRET || "")
                .update(
                    JSON.stringify({
                        email: savedUser.email,
                        password: savedUser.password
                    }).trim()
                )
                .digest("hex")
        });

        return token;
    } catch (error) {
        console.error("Error signing up user:", error);

        if (error instanceof ApiError) {
            throw error; // Re-throw known ApiErrors
        }

        throw new ApiError(500, "Internal server error");
    }
};

/**
 * Get the profile of a user by their ID.
 * @param {string} id - The user's ID.
 * @return {Promise<UserProfileResponse>} - Returns the user's profile information if found, otherwise throws an error.
 */
export const getUserProfile = async (
    id: string
): Promise<UserProfileResponse> => {
    try {
        const user = await getUserById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return {
            name: user.name || "",
            email: user.email
        };
    } catch (error) {
        console.error("Error getting user profile:", error);

        if (error instanceof ApiError) {
            throw error; // Re-throw known ApiErrors
        }

        throw new ApiError(500, "Internal server error");
    }
};
