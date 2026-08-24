const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.user = {
        _id: null,
        role: "guest",
        isGuest: true,
      };
    }

    const rawRole = req.user.role || "guest";
    const position = req.user.position || null;

    const normalizedRole = rawRole === "staff" && position === "cashier" ? "cashier" : rawRole;

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({
        message: "Forbidden: Access denied",
      });
    }

    req.user.effectiveRole = normalizedRole;
    next();
  };
};

export default allowRoles;