
import { useState } from "react"
import "../styles/AdminDashboard.css"
import VOCStatsCard from "../components/voc/VocStatsCard"
import QuickActions from "../components/QuickActions"
function AdminDashboard() {

    const bookings = {
        "2026-03-02": 0,
        "2026-03-03": 0,
        "2026-03-04": 0,
        "2026-03-05": 0,
        "2026-03-06": 5,
        "2026-03-07": 2,
        "2026-03-08": 0
    }

    const [currentDate, setCurrentDate] = useState(new Date())

    // get monday of current week
    const getWeek = (date) => {

        const start = new Date(date)
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1)

        start.setDate(diff)

        let week = []

        for (let i = 0; i < 7; i++) {
            let d = new Date(start)
            d.setDate(start.getDate() + i)
            week.push(d)
        }

        return week
    }

    const week = getWeek(currentDate)

    // week range text
    const start = week[0]
    const end = week[6]

    const range = `${start.getDate()} ${start.toLocaleString("en", { month: "short" })} - ${end.getDate()}
 ${end.toLocaleString("en", { month: "short" })} ${end.getFullYear()}`

    const prevWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const nextWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    return (

        <section>
           <div>
             <div className="calandar-div">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <h3>📅 Bookings This Week</h3>

                <div className="week-navigation">

                    <button onClick={prevWeek}>‹</button>

                    <span>{range}</span>

                    <button onClick={nextWeek}>›</button>

                </div>

            </div>


            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                gap: "15px",
                marginTop: "20px"
            }}>

                {week.map((day) => {

                    const formatted = day.toISOString().split("T")[0]
                    const count = bookings[formatted] || 0

                    return (

                        <div 
                        className="calandar-dates"
                        key={formatted} >

                            <p className="calendar-day">
                                {day.toLocaleDateString("en-US", { weekday: "short" })}
                            </p>

                            <h3>{day.getDate()}</h3>

                            <p className="booking-count" >{count}</p>

                        </div>

                    )

                })}

            </div>
            </div>
            <VOCStatsCard/>
            <QuickActions/>
           </div>
        </section>

    )

}

export default AdminDashboard