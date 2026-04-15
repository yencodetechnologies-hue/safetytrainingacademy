const express = require("express")
const router = express.Router()

const {
 createSchedule,
 getCourseSchedules,
 deleteSchedule,
 toggleSession,
 deleteSession,
 addSession,
 editSession
} = require("../controllers/scheduleController")


router.post("/",createSchedule)
router.post("/session",addSession)
router.get("/course/:courseId",getCourseSchedules)
router.patch("/session/:id",toggleSession)
router.delete("/session/:id",deleteSession)
router.delete("/:id",deleteSchedule)
router.patch("/session/:id/edit", editSession)


module.exports = router