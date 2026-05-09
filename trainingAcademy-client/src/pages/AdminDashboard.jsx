import { useState, useEffect } from "react"
import "../styles/AdminDashboard.css"
import VOCStatsCard from "../components/voc/VocStatsCard"
import QuickActions from "../components/QuickActions"
import { API_URL } from "../data/service"

function AdminDashboard() {

    const [bookings, setBookings] = useState({})
    const [currentDate, setCurrentDate] = useState(new Date())
    const [vocStats, setVocStats] = useState({ pending: 0, verified: 0, total: 0 })

    const fetchBookings = async (date) => {
        try {
            const isoDate = new Date(date).toISOString()
            const response = await fetch(`${API_URL}/api/flow/weekly?date=${encodeURIComponent(isoDate)}`)
            if (!response.ok) throw new Error("Failed to load booking counts")
            const data = await response.json()
            setBookings(data.counts || {})
        } catch (error) {
            console.error("Admin dashboard weekly bookings error:", error)
            setBookings({})
        }
    }

    const fetchVocStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/voc/stats`)
            if (!res.ok) throw new Error("Failed to load VOC stats")
            const data = await res.json()
            setVocStats({
                pending:  data.pending  || 0,
                verified: data.verified || 0,
                total:    data.total    || 0,
            })
        } catch (error) {
            console.error("Admin dashboard VOC stats error:", error)
            setVocStats({ pending: 0, verified: 0, total: 0 })
        }
    }

    useEffect(() => {
        fetchBookings(currentDate)
    }, [currentDate])

    useEffect(() => {
        fetchVocStats()
    }, [])

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
    const start = week[0]
    const end = week[6]
    const range = `${start.getDate()} ${start.toLocaleString("en", { month: "short" })} - ${end.getDate()} ${end.toLocaleString("en", { month: "short" })} ${end.getFullYear()}`

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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="calander-dates">
                        <h3>📅 Bookings This Week</h3>
                        <div className="week-navigation">
                            <button onClick={prevWeek}>‹</button>
                            <span>{range}</span>
                            <button onClick={nextWeek}>›</button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7,1fr)",
                            gap: "15px",
                            marginTop: "20px",
                            minWidth: "460px"
                        }}>
                            {week.map((day) => {
                                const y = day.getFullYear()
                                const m = String(day.getMonth() + 1).padStart(2, "0")
                                const d = String(day.getDate()).padStart(2, "0")
                                const formatted = `${y}-${m}-${d}`
                                const count = bookings[formatted] || 0
                                return (
                                    <div className="calandar-dates" key={formatted}>
                                        <p className="calendar-day">
                                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                                        </p>
                                        <h3>{day.getDate()}</h3>
                                        <p className="booking-count">{count}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>
                <VOCStatsCard
                    pending={vocStats.pending}
                    verified={vocStats.verified}
                    total={vocStats.total}
                />
                <QuickActions />
            </div>
        </section>
    )
}

export default AdminDashboard