import type { Request, Response } from "express";
import {
    getPosts as getPostsService,
    createPost as createPostService,
    deletePost as deletePostService
} from "../services/post.services";
import { ApiError } from "../classes";

export const getPosts = async (req: Request, res: Response) => {
    try {
        const { skip, limit } = req.query;
        const parsedSkip = skip !== undefined ? Number(skip) : undefined;
        const parsedLimit = limit !== undefined ? Number(limit) : undefined;

        if (parsedSkip !== undefined && parsedSkip < 0) {
            throw new ApiError(400, "Skip value cannot be negative");
        }

        if (parsedSkip !== undefined && isNaN(parsedSkip)) {
            throw new ApiError(400, "Invalid skip value");
        }

        if (parsedLimit !== undefined && isNaN(parsedLimit)) {
            throw new ApiError(400, "Invalid limit value");
        }

        const post = await getPostsService(parsedSkip, parsedLimit);

        return res.sendResponse("success", 200, {
            message: "Posts retrieved successfully",
            data: post
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode, {
                message: error.message
            });
        }

        return res.sendResponse("error", 500, {
            message: "An unexpected error occurred while retrieving posts"
        });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, content, expiresAt } = req.body;
        const id = req.user?.id;

        if (!title || !content) {
            throw new ApiError(400, "Title and content are required");
        }

        if (!id) {
            throw new ApiError(401, "Unauthorized");
        }

        const post = await createPostService({
            title,
            content,
            expiresAt: expiresAt ?? undefined,
            authorId: id
        });

        return res.sendResponse("success", 201, {
            message: "Post created successfully",
            data: post
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode, {
                message: error.message
            });
        }

        return res.sendResponse("error", 500, {
            message: "An unexpected error occurred while creating the post"
        });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body;
        const id = req.user?.id;

        if (!postId) {
            throw new ApiError(400, "Post ID is required");
        }

        if (!id) {
            throw new ApiError(401, "Unauthorized");
        }

        const post = await deletePostService(id, postId);

        return res.sendResponse("success", 200, {
            message: "Post deleted successfully",
            data: post
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.sendResponse("error", error.statusCode, {
                message: error.message
            });
        }

        return res.sendResponse("error", 500, {
            message: "An unexpected error occurred while deleting the post"
        });
    }
};
