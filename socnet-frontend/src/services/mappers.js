import { getFileUrl } from "./upload";

const defaultAvatar = "/defaultAvatar.jpg"; // bill gates mugshot

export const mapUser = (user) => {
    if (!user)
        return null;

    return {
        ...user,
        avatar: !user.avatar ? defaultAvatar : getFileUrl(user.avatar)
    };
};

export const mapComment = (comment) => {
    if (!comment) return null;
    return {
        ...comment,
        user: mapUser(comment.user)
    };
};

export const mapPost = (post) => {
    if (!post) return null;
    return {
        ...post,
        image: getFileUrl(post.image),
        user: mapUser(post.user)
    };
};