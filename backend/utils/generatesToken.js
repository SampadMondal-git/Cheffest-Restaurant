import jwt from "jsonwebtoken";

export const jwtCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
};

const generateToken = (user, res, rememberMe = false) => {
    const token = jwt.sign(
        { userId: user._id, role: user.role, position: user.position },
        process.env.JWT_SECRET_KEY,
        { expiresIn: rememberMe ? "30d" : "1d" }
    );

    const cookieOptions = { ...jwtCookieOptions };

    if(rememberMe) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    res.cookie("jwt", token, cookieOptions);

    // res.cookie("jwt", token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV !== "development",
    //     sameSite: "strict",
    //     maxAge: 30 * 24 * 60 * 60 * 1000,
    // });

    return token;
};

export default generateToken;