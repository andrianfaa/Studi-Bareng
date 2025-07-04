import { Schema } from "mongoose";
import crypto from "node:crypto";

export type User = {
    id?: string;
    name?: string;
    email: string;
    password: string;
};

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt: {
        type: Date,
        default: () => Date.now()
    }
});

UserSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Exclude password from JSON output
    }
});

UserSchema.pre("save", function (next) {
    const userPassword = this.password;
    const encryptedPassword = crypto
        .createHmac("sha256", process.env.PASSWORD_SECRET || "UAS-2025")
        .update(userPassword)
        .digest("hex");

    this.password = encryptedPassword;

    next();
});

export default UserSchema;
