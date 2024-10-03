const { view, create, update, deletedTask, filterSorting } = require("../controllers/taskControllers");
const { isAuthenticatedUser, authorizeRole } = require("../middleware/auth");


const router=require("express").Router();

router.post("/task",isAuthenticatedUser,authorizeRole("admin"), create);
router.get("/task",isAuthenticatedUser,authorizeRole("admin"), view);
router.put("/task/:id",isAuthenticatedUser,authorizeRole("admin"), update);
router.delete("/task/:id",isAuthenticatedUser,authorizeRole("admin"),deletedTask);

router.get("/",filterSorting);

module.exports=router;