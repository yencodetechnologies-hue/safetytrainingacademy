const express = require("express");
const router = express.Router();
const {
  getAll,
  getOne,
  create,
  update,
  toggleStatus,
  remove,
  enroll,
} = require("../controllers/enrollmentLinkController");

router.get("/",                        getAll);
router.get("/:id",                     getOne);
router.post("/",                       create);
router.put("/:id",                     update);
router.patch("/:id/toggle-status",     toggleStatus);
router.delete("/:id",                  remove);
router.post("/:id/enroll",             enroll);

module.exports = router;