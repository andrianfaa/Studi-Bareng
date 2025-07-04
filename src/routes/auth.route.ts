import { Router } from "express";
import { getProfile, signIn, signUp } from "../controllers/auth.controller";
import { jwtMiddleware } from "../middlewares";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

router.get("/", jwtMiddleware(), getProfile);

export default router;
