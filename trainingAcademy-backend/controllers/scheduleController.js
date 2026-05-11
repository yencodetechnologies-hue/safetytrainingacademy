const Schedule = require("../models/schedule")

const resolveDisplayPrice = (course) => {
    const pt = course.pricingType || "standard"
    if (pt === "experience") return course.withoutExperiencePrice || course.withExperiencePrice || 0
    if (pt === "slbl")       return course.slSinglePrice || 0
    return course.sellingPrice || 0
}

const createSchedule = async (req,res) => {
 try{
  const schedule = new Schedule(req.body)
  const savedSchedule = await schedule.save()
  res.status(201).json(savedSchedule)
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const getUpcomingSessions = async (req, res) => {
    try {
        const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
        const today = new Date(nowSydney.getFullYear(), nowSydney.getMonth(), nowSydney.getDate());

        const limit = parseInt(req.query.limit) || 10

        const schedules = await Schedule.find({
            date: { $gte: today }
        })
            .populate("course", "title pricingType sellingPrice slSinglePrice withExperiencePrice withoutExperiencePrice location duration slug _id")
            .sort({ date: 1 })
            .lean()

        const upcoming = []

        schedules.forEach(schedule => {
            if (!schedule.course) return

            const dateObj  = new Date(schedule.date)
            const isSunday = dateObj.getDay() === 0

            const day = dateObj.getDate().toString()
            const mon = dateObj.toLocaleString("en-AU", { month: "short" })

            const activeSession = schedule.sessions?.find(s => s.status === "Active")
            if (!activeSession) return

            const slots = activeSession.availableSlots
            let spotsType = "ok"
            if (slots === 0)      spotsType = "full"
            else if (slots <= 3)  spotsType = "low"

            upcoming.push({
                scheduleId:    schedule._id,
                sessionId:     activeSession._id,
                date:          schedule.date,
                day,
                mon,
                isSunday,
                startTime:     activeSession.startTime  || "8:30am",
                endTime:       activeSession.endTime    || "4:30pm",
                location:      activeSession.location   || schedule.course.location || "Sefton",
                availableSlots: slots,
                spotsLabel:    slots === 0 ? "Full" : `${slots} spots`,
                spotsType,
                sessionType:   activeSession.sessionType,
                course: {
                    id:       schedule.course._id,
                    title:    schedule.course.title,
                    price:    resolveDisplayPrice(schedule.course),
                    location: schedule.course.location || "Sefton",
                    duration: schedule.course.duration,
                    slug:     schedule.course.slug,
                },
            })
        })

        res.json(upcoming.slice(0, limit))

    } catch (err) {
        console.error("getUpcomingSessions error:", err)
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const editSession = async (req, res) => {
  try {
    const { startTime, endTime, maxCapacity, availableSlots } = req.body
 
    const schedule = await Schedule.findOne({ "sessions._id": req.params.id })
 
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }
 
    const session = schedule.sessions.id(req.params.id)
 
    if (startTime)   session.startTime   = startTime
    if (endTime)     session.endTime     = endTime
    if (availableSlots !== undefined) session.availableSlots = Number(availableSlots)
 
    await schedule.save()
 
    res.json(schedule)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addSession = async (req, res) => {
  try {
    const { course, date, session } = req.body;

    // availableSlots is now passed directly from the frontend

    let schedule = await Schedule.findOne({ course, date });

    if (!schedule) {
      schedule = new Schedule({
        course,
        date,
        sessions: [session],
      });
    } else {
      schedule.sessions.push(session);
    }

    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const toggleSession = async(req,res)=>{
 const schedule = await Schedule.findOne({
  "sessions._id":req.params.id
 })
 const session =
 schedule.sessions.id(req.params.id)
 session.status =
 session.status === "Active"
 ? "Inactive"
 : "Active"
 await schedule.save()
 res.json(schedule)
}

const getCourseSchedules = async (req, res) => {
  try {
    const nowSydney = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
    const now = nowSydney;
    const today = new Date(nowSydney.getFullYear(), nowSydney.getMonth(), nowSydney.getDate());

    const schedules = await Schedule.find({
      course: req.params.courseId,
      date: { $gte: today }
    }).sort({ date: 1 })

    const filteredSchedules = schedules.map(schedule => {

      const isToday = schedule.date.toDateString() === now.toDateString()

      // Not today → keep all active sessions as-is
      if (!isToday) return schedule

      // Today → filter sessions smartly
      const filteredSessions = schedule.sessions.filter(session => {

        // Parse startTime
        const [startH, startM] = session.startTime.split(":").map(Number)
        const sessionStart = new Date(schedule.date)
        sessionStart.setHours(startH, startM, 0, 0)

        // Parse endTime
        const [endH, endM] = session.endTime.split(":").map(Number)
        const sessionEnd = new Date(schedule.date)
        sessionEnd.setHours(endH, endM, 0, 0)

        const isEnded    = now >= sessionEnd           // 5:00 PM கடந்துட்டா → hide
        const isUpcoming = sessionStart > now          // இன்னும் ஆரம்பிக்கல
        const isBookable = session.availableSlots > 0  // slots இருக்கா

        // ✅ Show if:
        // - Session ended → always hide (9-5 na 5 கடந்தா போச்சு)
        // - Not ended + upcoming → show
        // - Not ended + started but slots available → show (last-minute booking)
        if (isEnded) return false
        return isUpcoming || isBookable

      })

      return {
        ...schedule._doc,
        sessions: filteredSessions
      }

    }).filter(schedule => schedule.sessions.length > 0)

    res.json(filteredSchedules)

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}

const deleteSchedule = async (req,res) => {
 try{
  await Schedule.findByIdAndDelete(req.params.id)
  res.json({
   message:"Schedule deleted"
  })
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const deleteSession = async(req,res)=>{
 try{
  const schedule = await Schedule.findOne({
   "sessions._id":req.params.id
  })
  if(!schedule){
   return res.status(404).json({
    message:"Schedule not found"
   })
  }
schedule.sessions.pull(req.params.id)

if(schedule.sessions.length === 0){
  await schedule.deleteOne()
}else{
  await schedule.save()
}
  res.json({
   message:"Session deleted"
  })
 }
 catch(err){
  res.status(500).json({
   message:err.message
  })
 }
}

const getActiveCoursIds = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const schedules = await Schedule.find({
      date: { $gte: today }
    }).select("course sessions").lean()

    const ids = [...new Set(
      schedules
        .filter(s => s.sessions.some(sess => sess.status === "Active"))
        .map(s => String(s.course))
    )]

    res.json(ids)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
 createSchedule,
 getCourseSchedules,
 deleteSchedule,
 addSession,
 toggleSession,
 deleteSession,
 editSession,
 getUpcomingSessions,
 getActiveCoursIds
}





