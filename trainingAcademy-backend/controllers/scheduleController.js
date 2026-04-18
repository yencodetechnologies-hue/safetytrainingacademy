const Schedule = require("../models/schedule")


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

const editSession = async (req, res) => {
  try {
    const { startTime, endTime, maxCapacity } = req.body
 
    const schedule = await Schedule.findOne({ "sessions._id": req.params.id })
 
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }
 
    const session = schedule.sessions.id(req.params.id)
 
    if (startTime)   session.startTime   = startTime
    if (endTime)     session.endTime     = endTime
    if (maxCapacity) session.maxCapacity = Number(maxCapacity)
 
    await schedule.save()
 
    res.json(schedule)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addSession = async (req, res) => {
  try {
    const { course, date, session } = req.body;

    session.availableSlots = session.maxCapacity;

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
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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

module.exports = {
 createSchedule,
 getCourseSchedules,
 deleteSchedule,
 addSession,
 toggleSession,
 deleteSession,
 editSession
}





