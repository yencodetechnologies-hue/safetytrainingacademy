import Navbar from "../components/landingPage/Navbar"
import Sidebar from "../components/Sidebar"
import AdminDashborad from "./AdminDashboard"
import { Outlet, useLocation } from "react-router-dom"
import "../styles/PortalLayout.css"

function PortalLayout({ user }) {
    const location = useLocation();
    const isEnrollmentForm = location.pathname === "/student/enrollment-form";
    const hideNavAndSidebar = user?.role === "Student" && isEnrollmentForm;

    return (

        <div>

            {!hideNavAndSidebar && <Navbar user={user} />}

            <div style={{ display: "flex" }}>

                {!hideNavAndSidebar && <Sidebar user={user} />}

                <div style={{ flex: 1, overflowY: "auto", height: hideNavAndSidebar ? "100vh" : "calc(100vh - 70px)", background: "#f5f3ff" }} className="main-layout-admin">
                    <Outlet />
                </div>

            </div>

        </div>

    )

}

export default PortalLayout