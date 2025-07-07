import type { NextFunction, Request, Response } from "express";
import {
    checkToken,
    type AuthenticatedUserResponse
} from "../services/user.services";
import { verifyJwt } from "../utils";
import { ApiError } from "../classes";

export const jwtMiddleware =
    () => async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")?.[1] || "'";

        if (!token) {
            return res.sendResponse("error", 401, {
                message: "Unauthorized"
            });
        }

        try {
            const user = verifyJwt<AuthenticatedUserResponse>(token);

            console.log({
                "Token didapatkan": token,
                "User": user
            });

            if (!user) {
                return res.sendResponse("error", 401, {
                    message: "Invalid token"
                });
            }

            const authorizedUser = await checkToken(user.id, user.token);

            console.log("Authorized user : ", authorizedUser);

            if (!authorizedUser) {
                return res.sendResponse("error", 401, {
                    message: "Unauthorized"
                });
            }

            req.user = user;

            next();
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                return res.sendResponse("error", error.statusCode, {
                    message: error.message
                });
            }

            return res.sendResponse("error", 500, {
                message: "Internal server error"
            });
        }
    };
