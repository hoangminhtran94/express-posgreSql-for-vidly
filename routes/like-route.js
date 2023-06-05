const express = require("express");
const checkAuth = require("../middleware/auth");
const { postLike } = require("../controller/like-controller");
const router = express.Router();
router.use(checkAuth);
router.post("/:mid", postLike);

module.exports = router;
