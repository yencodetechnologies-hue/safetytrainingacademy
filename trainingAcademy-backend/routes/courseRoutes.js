const express = require("express")
const router = express.Router()
const { uploadCourse } = require("../middleware/upload")
const parseFormData = require("../middleware/parseFormData")

const {
    createCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCourseById,
    getCourseBySlug,
    checkSlugAvailability,
    reorderCourses,
} = require("../controllers/courseController")

router.get("/", getCourses)
// Reorder route — MUST be before /:id route so it doesn't get treated as an id.
router.put("/reorder/all", reorderCourses)

// Slug-based routes — also MUST come before /:id, otherwise the ":id"
// pattern would swallow them.
router.get("/slug-available/:slug", checkSlugAvailability)
router.get("/slug/:slug", getCourseBySlug)

router.post("/", uploadCourse.single("image"), parseFormData, createCourse)
router.put("/:id", uploadCourse.single("image"), parseFormData, updateCourse)
router.delete("/:id", deleteCourse)
router.get("/:id", getCourseById)

module.exports = router