import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CompanyViewModal.css"

/* ── Icons ── */
const CloseIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const BuildingIcon = ({ size = 22, color = "white" }) => (
    <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const MailIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const OrderIcon = () => (
    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </svg>
);
const CourseLinkIcon = () => (
    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);
const EnrolmentIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const CopyIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const ExternalLinkIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);
const ChevronDownIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const ChevronUpIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

/* ── Order Row (collapsible) ── */
function OrderRow({ order }) {
    const [open, setOpen] = useState(false);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
            "\n" + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    return (
        <div className="cvm-order-block">
            <div className="cvm-order-header" onClick={() => setOpen(v => !v)}>
                <div className="cvm-order-left">
                    <span className="cvm-order-label">Order — </span>
                    <span className="cvm-order-date">{order.date}</span>
                    <span className="cvm-order-pay-tag">{order.payMethod}</span>
                </div>
                <div className="cvm-order-right">
                    <span className="cvm-order-amount">{order.amount}</span>
                    <span className={`cvm-order-status ${order.status === "Completed" ? "cvm-status-completed" : "cvm-status-pending"}`}>
                        {order.status}
                    </span>
                    <span className="cvm-order-chevron">{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
                </div>
            </div>

            {order.orderId && (
                <div className="cvm-order-id">{order.orderId}</div>
            )}

            {open && order.courses && order.courses.map((course, ci) => (
                <div key={ci} className="cvm-course-block">
                    <div className="cvm-course-title-row">
                        <span className="cvm-course-num">{ci + 1}</span>
                        <span className="cvm-course-name">{course.name}</span>
                    </div>
                    <div className="cvm-course-meta">
                        <span className="cvm-enrolled-count">
                            <EnrolmentIcon /> {course.enrolledCount} enrolled
                        </span>
                        <button className="cvm-icon-btn" title="Copy link"><CopyIcon /></button>
                        <button className="cvm-icon-btn" title="Open"><ExternalLinkIcon /></button>
                    </div>

                    {course.students && course.students.length > 0 && (
                        <div className="cvm-student-table-wrap">
                            <table className="cvm-student-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>NAME</th>
                                        <th>COURSE</th>
                                        <th>AMOUNT</th>
                                        <th>PAYMENT</th>
                                        <th>LLND</th>
                                        <th>FORM</th>
                                        <th>TRAINING</th>
                                        <th>ENROLLED</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {course.students.map((s, si) => (
                                        <tr key={si}>
                                            <td>{si + 1}</td>
                                            <td>
                                                <div className="cvm-stu-name">{s.name}</div>
                                                <div className="cvm-stu-meta">{s.email}</div>
                                                {s.phone && <div className="cvm-stu-meta">{s.phone}</div>}
                                            </td>
                                            <td>{s.course}</td>
                                            <td>{s.amount}</td>
                                            <td><span className={`cvm-tag cvm-tag-${s.payment?.toLowerCase()}`}>{s.payment}</span></td>
                                            <td><span className={`cvm-tag cvm-tag-${s.llnd?.toLowerCase().replace(/ /g, "-")}`}>{s.llnd}</span></td>
                                            <td><span className={`cvm-tag cvm-tag-${s.form?.toLowerCase()}`}>{s.form}</span></td>
                                            <td><span className={`cvm-tag cvm-tag-${s.training?.toLowerCase()}`}>{s.training}</span></td>
                                            <td><div className="cvm-stu-date">{s.enrolled}</div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Main Modal ── */
export default function CompanyViewModal({ company, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!company) return;
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `http://localhost:8000/api/companies/${company._id}/details`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                // fallback: use company prop directly
                setData(company);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [company]);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    const formatJoined = (dateStr) => {
        if (!dateStr) return { date: "—", time: "" };
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("en-GB"),
            time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
        };
    };

    const joined = formatJoined(data?.createdAt);

    // Mock orders — replace with real data from API response
    const orders = data?.orders || [];

    return (
        <div className="cvm-backdrop" onClick={handleBackdrop}>
            <div className="cvm-modal">
                {/* ── Header ── */}
                <div className="cvm-header">
                    <div className="cvm-header-left">
                        <div className="cvm-company-avatar">
                            <BuildingIcon size={22} color="white" />
                        </div>
                        <div>
                            <h2 className="cvm-company-name">{data?.companyName || "Company"}</h2>
                            <p className="cvm-company-tagline">Live enrolment list, orders, and per-link students</p>
                        </div>
                    </div>
                    <button className="cvm-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="cvm-body">
                    {loading ? (
                        <div className="cvm-loading">Loading...</div>
                    ) : (
                        <>
                            {/* Description */}
                            <p className="cvm-desc">
                                The table below lists every company enrolment (course, LLND, form, payment). Further down you can
                                open orders and copy share links.
                            </p>

                            {/* Profile card */}
                            <div className="cvm-profile-card">
                                <a href={`mailto:${data?.email}`} className="cvm-profile-email">
                                    <MailIcon />
                                    <span>{data?.email}</span>
                                </a>
                                <div className="cvm-profile-divider" />
                                <div className="cvm-profile-joined">
                                    <CalendarIcon />
                                    <div>
                                        <span className="cvm-joined-label">Joined</span>
                                        <span className="cvm-joined-date">{joined.date}</span>
                                        <span className="cvm-joined-time">{joined.time}</span>
                                    </div>
                                </div>
                                <div className="cvm-profile-right">
                                    <span className={`cvm-account-badge ${data?.status === "Active" ? "cvm-badge-active" : "cvm-badge-inactive"}`}>
                                        {data?.status === "Active" ? "Active account" : "Inactive account"}
                                    </span>
                                    <span className="cvm-last-login">Last login: {data?.lastLogin || "Never"}</span>
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="cvm-stats-row">
                                <div className="cvm-stat-card cvm-stat-purple">
                                    <div className="cvm-stat-icon cvm-icon-purple"><OrderIcon /></div>
                                    <div>
                                        <div className="cvm-stat-num">{data?.ordersCount ?? data?.orders?.length ?? 0}</div>
                                        <div className="cvm-stat-label">Orders</div>
                                    </div>
                                </div>
                                <div className="cvm-stat-card cvm-stat-blue">
                                    <div className="cvm-stat-icon cvm-icon-blue"><CourseLinkIcon /></div>
                                    <div>
                                        <div className="cvm-stat-num">{data?.courseLinksCount ?? data?.courseLinks?.length ?? 0}</div>
                                        <div className="cvm-stat-label">Course links</div>
                                    </div>
                                </div>
                                <div className="cvm-stat-card cvm-stat-gray">
                                    <div className="cvm-stat-icon cvm-icon-gray">
                                        <EnrolmentIcon />
                                    </div>
                                    <div>
                                        <div className="cvm-stat-num">{data?.enrolmentsCount ?? data?.enrolments?.length ?? 0}</div>
                                        <div className="cvm-stat-label">Company enrolments</div>
                                    </div>
                                </div>
                            </div>

                            {/* Students Table */}
                            {data?.students && data.students.length > 0 && (
                                <div className="cvm-section">
                                    <div className="cvm-section-header">
                                        <h3 className="cvm-section-title">Students registered under this company</h3>
                                        <p className="cvm-section-sub">
                                            Each row is one enrolment: course purchased, amount, payment status, LLND assessment, enrolment form, and training progress. Updates automatically when students complete steps.
                                        </p>
                                    </div>
                                    <div className="cvm-table-scroll">
                                        <table className="cvm-main-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>STUDENT</th>
                                                    <th>COURSE</th>
                                                    <th>AMOUNT</th>
                                                    <th>PAYMENT</th>
                                                    <th>LLND</th>
                                                    <th>ENROLMENT FORM</th>
                                                    <th>TRAINING</th>
                                                    <th>ENROLLED</th>
                                                    <th>BILL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.students.map((s, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <div className="cvm-stu-name">{s.name}</div>
                                                            <div className="cvm-stu-meta">{s.email}</div>
                                                            {s.phone && <div className="cvm-stu-meta">{s.phone}</div>}
                                                        </td>
                                                        <td>{s.course}</td>
                                                        <td>{s.amount}</td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.payment?.toLowerCase()}`}>{s.payment}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.llnd?.toLowerCase().replace(/ /g, "-")}`}>{s.llnd}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.form?.toLowerCase().replace(/ /g, "-")}`}>{s.form}</span></td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.training?.toLowerCase()}`}>{s.training}</span></td>
                                                        <td>
                                                            <div className="cvm-stu-date">{s.enrolled}</div>
                                                        </td>
                                                        <td><span className={`cvm-tag cvm-tag-${s.bill?.toLowerCase()}`}>{s.bill}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Orders */}
                            {orders.length > 0 && (
                                <div className="cvm-orders-section">
                                    {orders.map((order, i) => (
                                        <OrderRow key={i} order={order} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}