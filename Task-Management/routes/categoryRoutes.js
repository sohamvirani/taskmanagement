const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRole } = require("../middleware/auth");
const { getAllCategories, create } = require('../controllers/categoryControllers');


router.post("/category",isAuthenticatedUser,authorizeRole("admin"),create);
router.get("/category",isAuthenticatedUser,authorizeRole("admin"), getAllCategories);

module.exports = router;