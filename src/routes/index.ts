import { Router, type Request, type Response } from "express";
import { jwtMiddleware } from "../middlewares";

import authRouter from "./auth.route";
import postRouter from "./post.route";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.sendResponse("success", 200, {
        message: "Welcome to the API"
    });
});

router.use("/auth", authRouter);
router.use("/posts", jwtMiddleware(), postRouter);

export default router;
