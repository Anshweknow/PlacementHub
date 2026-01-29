const express = require("express");
const { register, login } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);


router.get("/test", auth, (req, res) => {
    res.json({ msg: "Middleware working!", user: req.user });
});

module.exports = router;
