const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Token format: "Bearer <token>"
        const token = tokenHeader.split(" ")[1];

        const decoded = jwt.verify(token, "secretKey");
        req.user = decoded;

        next();
    } catch (err) {
        console.log("JWT ERROR:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
    }
};
