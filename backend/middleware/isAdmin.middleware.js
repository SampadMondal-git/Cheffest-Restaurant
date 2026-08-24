import jwt from "jsonwebtoken";

const isAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;

        if (!req.user || req.user.role?.toLowerCase().trim() !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        next();

    } catch (error) {
        console.error(error);
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

export default isAdmin;