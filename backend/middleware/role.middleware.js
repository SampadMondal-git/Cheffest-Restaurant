const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.user = {
        _id: null,
        role: "guest",
        isGuest: true,
      };
    }

    const userRole = req.user.role || "guest";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: Access denied",
      });
    }

    next();
  };
};

export default allowRoles;