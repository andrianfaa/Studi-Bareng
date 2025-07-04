import { ApiError } from "../classes";
import { PostModel } from "../databases/models";

type CreatePostRequestBody = {
    authorId: string;
    title: string;
    content: string;
    expiresAt?: Date;
};

/**
 * Create a new post.
 * @param {CreatePostRequestBody} postData - The data for the new post.
 * @param {string} postData.authorId - The ID of the author creating the post.
 * @param {string} postData.title - The title of the post.
 * @param {string} postData.content - The content of the post.
 * @param {Date} [postData.expiresAt] - Optional expiration date for the post.
 * @return {Promise<Post>} - Returns the created post object if successful, otherwise throws an error.
 * @throws {ApiError} - Throws an error if the post creation fails or if required fields are missing.
 */
export const createPost = async ({
    authorId,
    title,
    content,
    expiresAt
}: CreatePostRequestBody) => {
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    try {
        const post = new PostModel({
            authorId,
            title,
            content,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
        const savedPost = await post.save();

        return savedPost;
    } catch (error) {
        console.error("Error when creating new post: ", error);

        if (error instanceof ApiError) {
            throw new ApiError(500, error.message);
        }

        throw new ApiError(500, "An unexpected error occurred");
    }
};

/**
 * Retrieve posts with pagination.
 * @param {number} [skip=0] - The number of posts to skip (for pagination).
 * @param {number} [limit=10] - The maximum number of posts to return (for pagination).
 * @return {Promise<Post[]>} - Returns an array of posts if successful, otherwise throws an error.
 * @throws {ApiError} - Throws an error if retrieving posts fails.
 */
export const getPosts = async (skip = 0, limit = 10) => {
    try {
        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("authorId", "name email") // Populate authorId with name and email
            .exec();
        return posts;
    } catch (error) {
        console.error("Error when retrieving posts: ", error);

        if (error instanceof ApiError) {
            throw new ApiError(500, error.message);
        }

        throw new ApiError(500, "An unexpected error occurred");
    }
};

/**
 * Delete a post by its ID.
 * @param {string} authorId - The ID of the author attempting to delete the post.
 * @param {string} postId - The ID of the post to delete.
 * @return {Promise<Post>} - Returns the deleted post object if successful, otherwise throws an error.
 * @throws {ApiError} - Throws an error if the post is not found, if the author is not authorized to delete the post, or if an unexpected error occurs.
 */
export const deletePost = async (authorId: string, postId: string) => {
    try {
        const post = await PostModel.findById(postId);

        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        const isAuthor = post.authorId.toString() === authorId;

        if (!isAuthor) {
            throw new ApiError(
                403,
                "You are not authorized to delete this post"
            );
        }

        const deletedPost = await PostModel.findByIdAndDelete(postId);

        return deletedPost;
    } catch (error) {
        console.error("Error when deleting post: ", error);

        if (error instanceof ApiError) {
            throw new ApiError(500, error.message);
        }

        throw new ApiError(500, "An unexpected error occurred");
    }
};
