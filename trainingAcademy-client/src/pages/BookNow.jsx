// ============================================================================
// BookNow.jsx — COMPLETE FILE WITH STRICT UPDATES
// ============================================================================

import { useState, useEffect, useRef } from "react";
import CourseSelection from "../components/course/CourseSelection";
import "../styles/BookNow.css";
import Payment from "../components/Payment";
import LLNDAssessment from "../components/llnd/LLNDAssessment";
import EnrollmentRegister from "../components/enrollmrntRegister/EnrollmentRegister";
import CourseSelectionSuccess from "../components/course/CourseSelectionSuccess";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom"
import Loading from "../components/Loading"
import { API_URL } from "../data/service";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function BookNow() {
    const location = useLocation()
    const navigate = useNavigate();
    const enrollRef = useRef(null);
    // Routes feeding into BookNow:
    //   /enroll/:id                  → enrollment-link token id
    //   /book-now/course/:slug       → public course booking by SEO slug
    //   /book-now/company/:id        → company-scoped booking (id)
    //   /book-now                    → blank, manual selection
    const { id: paramId, slug: paramSlug } = useParams();
    const [searchParams] = useSearchParams();
    const bookingType = searchParams.get("type");
    const enrollType = searchParams.get("enroll")
    const fromPortal = searchParams.get("fromPortal") === "true";

    const isEnrollmentLink = location.pathname.startsWith('/enroll/');
    const isCoursePath     = location.pathname.startsWith('/book-now/course/');
    // enrollId is the company id only — never the course slug.
    const enrollId         = isEnrollmentLink || isCoursePath ? null : paramId;
    const enrollmentLinkId = isEnrollmentLink ? paramId : null;
    const courseSlug       = isCoursePath ? paramSlug : null;

    const [isLoading, setIsLoading] = useState(!!paramId || !!paramSlug);

    // ✅ Token states (company link flow)
    const [tokenData, setTokenData] = useState(null)
    const [tokenError, setTokenError] = useState("")
    const [tokenLoading, setTokenLoading] = useState(false)

    // ✅ Enrollment link states
    const [enrollmentLinkData, setEnrollmentLinkData] = useState(null)
    const [enrollmentLinkError, setEnrollmentLinkError] = useState("")
    const [enrollmentLinkLoading, setEnrollmentLinkLoading] = useState(false)

    const [isEmailTaken, setIsEmailTaken] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState([])
    const [isCompanyEnroll, setIsCompanyEnroll] = useState(false);
    const [isDashboardCompany, setIsDashboardCompany] = useState(false);
    const [enrollmentType, setEnrollmentType] = useState(enrollType === "company" ? "company" : "individual");
    const [step, setStep] = useState(1);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollSection, setEnrollSection] = useState(1);
    const [isPaymentValid, setIsPaymentValid] = useState(false);
    const [triggerValidation, setTriggerValidation] = useState(false);
    const [paymentData, setPaymentData] = useState({});
    const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "" });
    const [companyUser, setCompanyUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const [isProcessing, setIsProcessing] = useState(false)

    const { user: authUser } = useContext(AuthContext);
    const loggedInUser = authUser || JSON.parse(localStorage.getItem("user") || "{}");
    const isStudentPortalAutofill = fromPortal && 
        (String(loggedInUser?.role || "").toLowerCase() === "student");

    const cardPaymentRef = useRef({ trigger: null, paymentMethod: "bank", paymentStatus: null })
    const [activePaymentMethod, setActivePaymentMethod] = useState("Bank Transfer")

    const isCompany = enrollmentType === "company"
    const hideEnrollmentType = isCompanyEnroll || isDashboardCompany
    const email = location.state?.email || "your email"

    // ✅ Individual course price
    //   1. course.__variant (user picked this in the variant-aware dropdown)
    //   2. URL ?type=… (legacy deep-link)
    //   3. Default (without-experience / single-license / sellingPrice)
    const getIndividualCoursePrice = (course) => {
        if (!course) return 0
        const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard")
        const v  = course.__variant || null

        if (pt === "slbl") {
            if (v === "slbl" || (v == null && bookingType === "slbl")) return course.slblPrice || 0
            return course.slSinglePrice || 0
        }

        if (pt === "experience") {
            if (v === "with-experience"    || (v == null && bookingType === "with-experience"))    return course.withExperiencePrice || 0
            if (v === "without-experience" || (v == null && bookingType === "without-experience")) return course.withoutExperiencePrice || 0
            return course.withoutExperiencePrice || course.withExperiencePrice || 0
        }

        return course.sellingPrice || 0
    }

    // ✅ coursePrice — company mode: sum of all, individual: single course
    const coursePrice = isCompany
        ? selectedCourses.reduce((sum, sc) => sum + (getIndividualCoursePrice(sc.course) * sc.quantity), 0)
        : getIndividualCoursePrice(selectedCourse)

    // ✅ Token validate — URL-ல ?token= இருந்தா
    useEffect(() => {
        const token = searchParams.get("token")
        if (!token) return

        setTokenLoading(true)
        fetch(`${API_URL}/api/course-links/validate/${token}`)
            .then(res => res.json())
            .then(async (data) => {
                if (data.valid) {
                    setTokenData(data.data)
                    setIsCompanyEnroll(true)
                    setEnrollmentType("individual")

                    if (data.data.courseId) {
                        try {
                            const courseRes = await fetch(`${API_URL}/api/courses/${data.data.courseId}`)
                            if (courseRes.ok) {
                                const course = await courseRes.json()
                                // We no longer call setSelectedCourse(course)
                            }
                        } catch (err) {
                            console.error("Failed to load token course details:", err)
                        }
                    }

                    if (data.data.sessionId || data.data.sessionDate) {
                        // We no longer call setSelectedSession(...)
                    }
                } else if (data.expired) {
                    setTokenError("expired")
                } else {
                    setTokenError("invalid")
                }
            })
            .catch(() => setTokenError("invalid"))
            .finally(() => setTokenLoading(false))
    }, [searchParams])

    // ✅ Enrollment link validate
    useEffect(() => {
        if (!isEnrollmentLink || !enrollmentLinkId) return

        setEnrollmentLinkLoading(true)
        fetch(`${API_URL}/api/enrollment-links/${enrollmentLinkId}`)
            .then(res => res.json())
            .then(async (data) => {
                if (data.success) {
                    const link = data.data
                    setEnrollmentLinkData(link)
                    setIsCompanyEnroll(true)
                    
                    // Set enrollment type based on agent flag
                    if (link.agent) {
                        setEnrollmentType("agent")
                    }

                    // Pre-select course if specified
                    if (link.course && link.course !== "Any course") {
                        try {
                            const coursesRes = await fetch(`${API_URL}/api/courses`)
                            const coursesData = await coursesRes.json()
                            const courses = Array.isArray(coursesData) ? coursesData : coursesData.data || []
                            const course = courses.find(c => c.title === link.course)
                            if (course) {
                                // We no longer call setSelectedCourse(course) here
                                // to ensure the student must select it manually.
                                console.log("Enrollment link course specified:", course.title);
                            }
                        } catch (err) {
                            console.error("Failed to load enrollment link course details:", err)
                        }
                    }
                } else {
                    setEnrollmentLinkError("Invalid enrollment link")
                }
            })
            .catch((err) => {
                console.error("Enrollment link validation failed:", err)
                setEnrollmentLinkError("Invalid enrollment link")
            })
            .finally(() => {
                setEnrollmentLinkLoading(false)
                setIsLoading(false)
            })
    }, [isEnrollmentLink, enrollmentLinkId])

    // Legacy redirect: /book-now?courseId=ABC[&type=...&sessionId=...]
    // → /book-now/course/{slug}[?type=...&sessionId=...]
    //
    // Old emails, Google's cache, and a handful of internal call sites
    // still use the query-string form. We look up the slug once and
    // rewrite the URL in place (replace: true) so the clean SEO URL
    // shows in the address bar and bookmarks. Other query params are
    // preserved verbatim so deep-linked sessions still work.
    useEffect(() => {
        if (isCoursePath || isEnrollmentLink) return
        const legacyCourseId = searchParams.get("courseId")
        if (!legacyCourseId) return

        let cancelled = false
        fetch(`${API_URL}/api/courses/${legacyCourseId}`)
            .then(res => res.ok ? res.json() : null)
            .then(course => {
                if (cancelled || !course?.slug) return
                const next = new URLSearchParams(searchParams)
                next.delete("courseId")
                const qs = next.toString()
                navigate(
                    qs
                        ? `/book-now/course/${course.slug}?${qs}`
                        : `/book-now/course/${course.slug}`,
                    { replace: true }
                )
            })
            .catch(() => { /* fall through — manual selection still works */ })

        return () => { cancelled = true }
    }, [isCoursePath, isEnrollmentLink, searchParams])

    // /book-now/course/:slug — pre-select the course by its SEO slug.
    // Falls back to legacy /book-now/course/{slug}-{ObjectId} format if
    // the redirect shim hasn't rewritten the URL yet on first render.
    useEffect(() => {
        if (!isCoursePath || !courseSlug) return
        const legacyMatch = courseSlug.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
        const fetchSlug = legacyMatch
            ? courseSlug.replace(`-${legacyMatch[1]}`, "")
            : courseSlug
        const fallbackId = legacyMatch ? legacyMatch[1] : null

        setIsLoading(true)
        fetch(`${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`)
            .then(async (res) => {
                if (res.ok) return res.json()
                if (fallbackId) {
                    const r = await fetch(`${API_URL}/api/courses/${fallbackId}`)
                    if (r.ok) return r.json()
                }
                throw new Error("not-found")
            })
            .then((course) => {
                if (course?._id) setSelectedCourse(course)
            })
            .catch(() => {
                // Bad slug — send the user back to the all-courses page
                // rather than getting stuck on a broken booking screen.
                navigate("/all-courses", { replace: true })
            })
            .finally(() => setIsLoading(false))
    }, [isCoursePath, courseSlug])

    useEffect(() => {
        if (selectedCourse?._id) localStorage.setItem("courseId", selectedCourse._id);
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedSession?._id) localStorage.setItem("sessionId", selectedSession._id);
    }, [selectedSession]);

    useEffect(() => {
        if (!enrollId) return;
        // The URL itself tells us this is a company-scoped booking
        // (path = /book-now/company/:id), so we configure the flow up-front
        // based on the auth state and don't gate the page render on a
        // server round-trip. The API call below is a non-blocking sanity
        // check that never redirects on transient failures (incognito,
        // offline, slow network, etc.).
        const isCompanyPath = location.pathname.startsWith("/book-now/company/");

        if (isCompanyPath) {
            // Priority: Use user from AuthContext, fallback to localStorage
            const effectiveUser = loggedInUser || JSON.parse(localStorage.getItem("user") || "{}");
            const storedRole = String(effectiveUser?.role || "").toLowerCase();
            const storedId   = String(effectiveUser?._id || effectiveUser?.id || "");
            const isAdmin = storedRole === "admin";
            const isLoggedInAsThisCompany = (storedRole === "company" && storedId === String(enrollId)) || isAdmin;

            if (isLoggedInAsThisCompany) {
                // Dashboard flow — the company (or an admin) is logged in and
                // managing its own bookings.
                setIsCompanyEnroll(false);
                setEnrollmentType("company");
                setIsDashboardCompany(true);

                // Initial pre-fill from stored user
                if (!isAdmin) {
                    setCompanyUser(effectiveUser);
                    setPaymentData(prev => ({
                        ...prev,
                        name: effectiveUser.name || "",
                        email: effectiveUser.email || "",
                        phone: (effectiveUser.phone || effectiveUser.mobileNumber || effectiveUser.mobile || ""),
                        agreed: true,
                    }));
                    setUserDetails({
                        name: effectiveUser.name || "",
                        email: effectiveUser.email || "",
                        phone: (effectiveUser.phone || effectiveUser.mobileNumber || effectiveUser.mobile || ""),
                    });
                }

                // 🔥 Always fetch latest company settings to ensure Pay Later toggle is up-to-date.
                // If an admin is logged in, we override the pre-filled data with the company's 
                // own info for a true dashboard experience.
                fetch(`${API_URL}/api/companies/${enrollId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            const companyData = data.data;
                            
                            if (isAdmin) {
                                setCompanyUser({ ...companyData, id: companyData._id });
                                setPaymentData(prev => ({
                                    ...prev,
                                    payLater: companyData.payLater
                                }));
                            } else {
                                setCompanyUser({ ...effectiveUser, payLater: companyData.payLater });
                                setPaymentData(prev => ({
                                    ...prev,
                                    payLater: companyData.payLater
                                }));
                            }
                        }
                    })
                    .catch(err => console.error("Failed to sync company settings:", err))
                    .finally(() => setIsLoading(false));
            } else {
                // Public / shared employee enrolment link — visitor enrols
                // as an individual student, attached to this company.
                setIsLoading(true);
                fetch(`${API_URL}/api/companies/${enrollId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setTokenData({ 
                                companyId: enrollId, 
                                payLater: data.data.payLater 
                            });
                            setIsCompanyEnroll(true);
                            setEnrollmentType("individual");
                            setIsDashboardCompany(false);
                        } else {
                            navigate("/");
                        }
                    })
                    .catch(() => navigate("/"))
                    .finally(() => setIsLoading(false));
            }
            return;
        }

        // Non /book-now/company/:id paths fall through to the legacy role
        // lookup (e.g. /book-now/course/:id which can be Student/Course/...).
        setIsLoading(true);
        fetch(`${API_URL}/api/book-now/check-role?id=${enrollId}`)
            .then(res => res.json())
            .then(data => {
                if (data.role === "company" || data.role === "Company") {
                    setIsCompanyEnroll(false);
                    setEnrollmentType("company");
                    setIsDashboardCompany(true);

                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    if (user) {
                        setCompanyUser(user);
                        setPaymentData(prev => ({
                            ...prev,
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.mobileNumber || "",
                            agreed: true,
                        }));
                        setUserDetails({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.mobileNumber || "",
                        });
                    }
                } else {
                    // Unknown id on a non-company path — back to home.
                    navigate("/");
                }
            })
            .catch(() => {
                // Don't trap the user on a blank page if the role API is
                // unreachable; just go home.
                navigate("/");
            })
            .finally(() => setIsLoading(false));
    }, [enrollId]);

    useEffect(() => {
        if (isStudentPortalAutofill && loggedInUser?.email) {
            const data = {
                name: loggedInUser.name || "",
                email: loggedInUser.email || "",
                phone: loggedInUser.phone || loggedInUser.mobileNumber || loggedInUser.mobile || "",
            };
            setUserDetails(prev => ({ ...prev, ...data }));
            setPaymentData(prev => ({
                ...prev,
                ...data,
                agreed: true,
            }));

            // 🔥 Robustness: If phone is missing from localStorage/Context, try fetching from profile API
            if (!data.phone) {
                const sid = loggedInUser.id || loggedInUser._id;
                if (sid) {
                    fetch(`${API_URL}/api/student/profile/${sid}`)
                        .then(res => res.json())
                        .then(profile => {
                            if (profile.phone) {
                                setUserDetails(prev => ({ ...prev, phone: profile.phone }));
                                setPaymentData(prev => ({ ...prev, phone: profile.phone }));
                            }
                        })
                        .catch(err => console.error("Portal autofill profile fetch failed:", err));
                }
            }
        }
    }, [isStudentPortalAutofill, loggedInUser]);

    useEffect(() => {
        if (step === 1) {
            setSelectedSession(null);
            localStorage.removeItem("enrollId");
            localStorage.removeItem("flowId");
            localStorage.removeItem("courseId");
            localStorage.removeItem("sessionId");
        }
    }, [step]);

    const totalSteps = (enrollmentType === "individual" || enrollmentType === "agent") ? 4 : 2;
    const effectiveStep = isCompanyEnroll ? step - 1 : step;
    const progress = (effectiveStep / totalSteps) * 100;

    const createFlow = async (slipUrl = "") => {
        try {
            const studentId = localStorage.getItem("enrollId");
            if (!studentId) return;
            const formData = new FormData();
            formData.append("studentId", studentId);
            formData.append("courseId", selectedCourse._id);
            formData.append("courseCategory", selectedCourse.category);
            formData.append("courseName", selectedCourse.title);
            formData.append("price", coursePrice);
            formData.append("enrollmentType", isCompanyEnroll ? "company" : enrollmentType);
            formData.append("sessionDate", selectedSession?.date);
            formData.append("startTime", selectedSession?.startTime);
            formData.append("endTime", selectedSession?.endTime);
            formData.append("sessionId", selectedSession?._id || "");
            formData.append("paymentMethod", paymentData.paymentMethod || "");
            formData.append("transactionId", paymentData.transactionId || "");
            formData.append("slipUrl", slipUrl);
            if (isEnrollmentLink) {
                formData.append("source", "Enrollment Link");
                formData.append("sourceToken", enrollmentLinkId);
                formData.append("paymentMethod", "Pay Later");
            } else if (tokenData?.companyId) {
                formData.append("companyId", tokenData.companyId);
                formData.append("source", "Booking Link");
                const linkToken = searchParams.get("token");
                if (linkToken) formData.append("sourceToken", linkToken);
            } else if (enrollId) {
                formData.append("companyId", enrollId);
                formData.append("source", "Company Link");
            }
            const res = await fetch(`${API_URL}/api/flow/create`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            localStorage.setItem("flowId", data._id);
        } catch (err) {
            console.error(err);
        }
    };

    const sendBookingEmail = async () => {
        try {
            await fetch(`${API_URL}/api/booking-email/send-confirmation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: paymentData.name,
                    email: paymentData.email,
                    courseName: selectedCourse?.title,
                    courseCode: selectedCourse?.courseCode,
                    courseDate: selectedSession?.date,
                    startTime: selectedSession?.startTime,
                    endTime: selectedSession?.endTime,
                    coursePrice,
                    paymentMethod: paymentData.paymentMethod,
                }),
            });
        } catch (err) {
            console.error("Email send failed:", err.message);
        }
    };

    const getNextLabel = () => {
        if (step === 2 && !isCompanyEnroll && !isEnrollmentLink) {
            if (paymentData.paymentMethod === "Pay Later") return "Confirm & Continue"
            return `🔒 Pay $${coursePrice} & Continue`
        }
        if (step === 2 && isEnrollmentLink) return "Create Account & Continue"
        if (step === 4 && enrollSection === 5) return "Submit"
        return "Next"
    }

    const handleNext = async () => {
        if (step === 2) {
            // ✅ ============================================================
            // ✅ ENROLLMENT LINK FLOW
            // ✅ ============================================================
            if (isEnrollmentLink) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    // Create student account
                    const formData = new FormData();
                    formData.append("name", paymentData.name);
                    formData.append("email", paymentData.email);
                    formData.append("phone", paymentData.phone);
                    formData.append("enrollmentType", enrollmentType);
                    formData.append("courseId", selectedCourse?._id);
                    formData.append("sessionDate", selectedSession?.date);
                    formData.append("startTime", selectedSession?.startTime);
                    formData.append("endTime", selectedSession?.endTime);

                    const res = await fetch(`${API_URL}/api/enroll/enrollment`, {
                        method: "POST",
                        body: formData,
                    });
                    const data = await res.json();
                    const studentId = data._id;
                    localStorage.setItem("enrollId", studentId);

                    // Create enrollment flow
                    await createFlow();

                    // Mark this enrollment link as used and record student after successful enrollment
                    if (enrollmentLinkId) {
                        const enrollLinkRes = await fetch(`${API_URL}/api/enrollment-links/${enrollmentLinkId}/enroll`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: paymentData.name,
                                email: paymentData.email,
                            }),
                        });
                        const enrollLinkData = await enrollLinkRes.json();
                        if (!enrollLinkRes.ok) {
                            throw new Error(enrollLinkData.message || "Enrollment link could not be used.");
                        }
                    }

                    // ✅ Send enrollment confirmation email (agent link registration)
                    try {
                        await fetch(`${API_URL}/api/booking-email/enrollment-link`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                toEmail: paymentData.email,
                                studentName: paymentData.name,
                                courseName: selectedCourse?.title || "Course",
                                courseCode: selectedCourse?.courseCode || "",
                                courseDate: selectedSession?.date || "To be confirmed",
                                startTime: selectedSession?.startTime || "",
                                endTime: selectedSession?.endTime || ""
                            })
                        });
                    } catch (emailErr) {
                        console.error("Email send failed:", emailErr.message);
                    }

                    // Auto-login the user
                    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: paymentData.email,
                            password: "123456"  // Default password
                        })
                    });
                    const loginData = await loginRes.json();
                    if (loginRes.ok) {
                        localStorage.setItem("user", JSON.stringify(loginData.user));
                        localStorage.setItem("token", loginData.token);
                    }

                    navigate("/student");
                } catch (err) {
                    alert(err.message);
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // ✅ ============================================================
            // ✅ COMPANY REGISTRATION FLOW (NEW COMPANY)
            // ✅ ============================================================
            if (enrollmentType === "company" && !enrollId) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    // ✅ 1. Register Company
                    const res = await fetch(`${API_URL}/api/companies/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            companyName: paymentData.name,
                            email:       paymentData.email,
                            password:    "123456",
                            mobileNumber: paymentData.phone,
                            contactPerson: paymentData.contactPerson || "",
                        })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.message || "Registration failed")

                    const companyId = data.data._id

                    // ✅ 2. Build courses payload
                    const coursesPayload = selectedCourses.map(sc => ({
                        courseId:      sc.course._id,
                        courseName:    sc.course.title,
                        courseCode:    sc.course.courseCode,
                        quantity:      sc.quantity,
                        pricePerPerson: getIndividualCoursePrice(sc.course),
                        sessionId:     sc.session?._id || "",
                        sessionDate:   sc.session?.date || null,
                        startTime:     sc.session?.startTime || "",
                        endTime:       sc.session?.endTime || "",
                    }))

                    // ✅ 3. Build FormData
                    const formData = new FormData()
                    formData.append("companyId", companyId)
                    formData.append("amount", coursePrice)
                    formData.append("paymentMethod", paymentData.paymentMethod || "Bank Transfer")
                    formData.append("transactionReference", paymentData.transactionId || "")
                    formData.append("courseCount", selectedCourses.length)
                    formData.append("notes", "")

                    coursesPayload.forEach((course, i) => {
                        formData.append(`courses[${i}][courseId]`,      course.courseId)
                        formData.append(`courses[${i}][courseName]`,    course.courseName)
                        formData.append(`courses[${i}][courseCode]`,    course.courseCode)
                        formData.append(`courses[${i}][quantity]`,      course.quantity)
                        formData.append(`courses[${i}][pricePerPerson]`,course.pricePerPerson)
                        formData.append(`courses[${i}][sessionId]`,     course.sessionId || "")
                        formData.append(`courses[${i}][sessionDate]`,   course.sessionDate || "")
                        formData.append(`courses[${i}][startTime]`,     course.startTime || "")
                        formData.append(`courses[${i}][endTime]`,       course.endTime || "")
                    })

                    if (paymentData.paymentSlip) {
                        formData.append("receipt", paymentData.paymentSlip)
                    }

                    // ✅ 4. Create CompanyPayment
                    const paymentRes = await fetch(`${API_URL}/api/company-payments`, {
                        method: "POST",
                        body: formData
                    })
                    const paymentResData = await paymentRes.json()
                    if (!paymentRes.ok) throw new Error(paymentResData.message || "Payment creation failed")

                    // ✅ 5. Generate Course Links — one per course
                    const linksRes = await fetch(`${API_URL}/api/course-links/generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            companyPaymentId: paymentResData.data._id,
                            companyId,
                            courses: coursesPayload,
                        })
                    })
                    const linksData = await linksRes.json()
                    const generatedLinks = linksData.data || []

                    // ✅ 6. Create EnrollmentFlows for each course
                    await Promise.all(selectedCourses.map(sc =>
                        fetch(`${API_URL}/api/flow/create`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                companyId,
                                courseId:      sc.course._id,
                                courseCategory: sc.course.category,
                                courseName:    sc.course.title,
                                price:         getIndividualCoursePrice(sc.course) * sc.quantity,
                                enrollmentType: "Company",
                                sessionDate:   sc.session?.date,
                                startTime:     sc.session?.startTime,
                                endTime:       sc.session?.endTime,
                                sessionId:     sc.session?._id || "",
                                quantity:      sc.quantity,
                                paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            })
                        })
                    ))

                    // ✅ 7. Navigate with generated links
                    navigate("/booking-success", {
                        state: {
                            selectedCourses,
                            coursePrice,
                            paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            email: paymentData.email,
                            name: paymentData.name,
                            enrollmentType: "company",
                            generatedLinks,  // ✅ Pass links
                        }
                    })
                } catch (err) {
                    alert(err.message)
                } finally {
                    setIsProcessing(false)
                }
                return
            }

            // ✅ ============================================================
            // ✅ COMPANY PAYMENT FLOW (EXISTING COMPANY)
            // ✅ ============================================================
            if (enrollmentType === "company" && enrollId) {
                setTriggerValidation(true)
                if (!isPaymentValid) return

                setIsProcessing(true)
                try {
                    const companyId = enrollId
                    const coursesPayload = selectedCourses.map(sc => ({
                        courseId:      sc.course._id,
                        courseName:    sc.course.title,
                        courseCode:    sc.course.courseCode,
                        quantity:      sc.quantity,
                        pricePerPerson: getIndividualCoursePrice(sc.course),
                        sessionId:     sc.session?._id || "",
                        sessionDate:   sc.session?.date || null,
                        startTime:     sc.session?.startTime || "",
                        endTime:       sc.session?.endTime || "",
                    }))

                    const formData = new FormData()
                    formData.append("companyId", companyId)
                    formData.append("amount", coursePrice)
                    formData.append("paymentMethod", paymentData.paymentMethod || "Bank Transfer")
                    formData.append("transactionReference", paymentData.transactionId || "")
                    formData.append("courseCount", selectedCourses.length)
                    formData.append("notes", "")

                    coursesPayload.forEach((course, i) => {
                        formData.append(`courses[${i}][courseId]`,      course.courseId)
                        formData.append(`courses[${i}][courseName]`,    course.courseName)
                        formData.append(`courses[${i}][courseCode]`,    course.courseCode)
                        formData.append(`courses[${i}][quantity]`,      course.quantity)
                        formData.append(`courses[${i}][pricePerPerson]`,course.pricePerPerson)
                        formData.append(`courses[${i}][sessionId]`,     course.sessionId || "")
                        formData.append(`courses[${i}][sessionDate]`,   course.sessionDate || "")
                        formData.append(`courses[${i}][startTime]`,     course.startTime || "")
                        formData.append(`courses[${i}][endTime]`,       course.endTime || "")
                    })

                    if (paymentData.paymentSlip) {
                        formData.append("receipt", paymentData.paymentSlip)
                    }

                    const paymentRes = await fetch(`${API_URL}/api/company-payments`, {
                        method: "POST",
                        body: formData
                    })
                    const paymentResData = await paymentRes.json()
                    if (!paymentRes.ok) throw new Error(paymentResData.message || "Payment creation failed")

                    const linksRes = await fetch(`${API_URL}/api/course-links/generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            companyPaymentId: paymentResData.data._id,
                            companyId,
                            courses: coursesPayload,
                        })
                    })
                    const linksData = await linksRes.json()
                    const generatedLinks = linksData.data || []

                    await Promise.all(selectedCourses.map(sc =>
                        fetch(`${API_URL}/api/flow/create`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                companyId,
                                courseId:      sc.course._id,
                                courseCategory: sc.course.category,
                                courseName:    sc.course.title,
                                price:         getIndividualCoursePrice(sc.course) * sc.quantity,
                                enrollmentType: "Company",
                                sessionDate:   sc.session?.date,
                                startTime:     sc.session?.startTime,
                                endTime:       sc.session?.endTime,
                                sessionId:     sc.session?._id || "",
                                quantity:      sc.quantity,
                                paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            })
                        })
                    ))

                    navigate("/booking-success", {
                        state: {
                            selectedCourses,
                            coursePrice,
                            paymentMethod: paymentData.paymentMethod || "Bank Transfer",
                            email: paymentData.email,
                            name: paymentData.name,
                            enrollmentType: "company",
                            generatedLinks,
                        }
                    })
                } catch (err) {
                    alert(err.message)
                } finally {
                    setIsProcessing(false)
                }
                return
            }

            // ✅ ============================================================
            // ✅ CARD PAYMENT FLOW (INDIVIDUAL)
            // ✅ ============================================================
            if (cardPaymentRef.current.paymentMethod === "Card Payment" && !isCompanyEnroll) {
                const success = await cardPaymentRef.current.trigger()
                if (!success) return

                setIsProcessing(true)
                try {
                    let studentId = localStorage.getItem("enrollId");
                    let slipUrl = "";

                    if (!studentId) {
                        const formData = new FormData();
                        formData.append("name", paymentData.name);
                        formData.append("email", paymentData.email);
                        formData.append("phone", paymentData.phone);
                        formData.append("paymentMethod", paymentData.paymentMethod);
                        formData.append("transactionId", paymentData.transactionId || "");
                        formData.append("courseId", selectedCourse?._id);
                        formData.append("sessionDate", selectedSession?.date);
                        formData.append("startTime", selectedSession?.startTime);
                        formData.append("endTime", selectedSession?.endTime);
                        formData.append("enrollmentType", isCompanyEnroll ? "company" : enrollmentType);
                        if (tokenData?.companyId) formData.append("companyId", tokenData.companyId);
                        else if (enrollId) formData.append("companyId", enrollId);

                        const res = await fetch(`${API_URL}/api/enroll/enrollment`, {
                            method: "POST",
                            body: formData,
                        });
                        const data = await res.json();
                        studentId = data._id;
                        localStorage.setItem("enrollId", studentId);
                        slipUrl = data.courses?.[0]?.slipUrl || "";
                    }

                    // ✅ Token use — company link வழியா வந்தா
                    const token = searchParams.get("token")
                    if (token) {
                        await fetch(`${API_URL}/api/course-links/use/${token}`, {
                            method: "PATCH"
                        })
                    }

                    const flowId = localStorage.getItem("flowId");
                    if (!flowId) await createFlow(slipUrl);
                    await sendBookingEmail();

                    navigate("/booking-success", {
                        state: {
                            selectedCourse,
                            courseDate: selectedSession?.date,
                            courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                            coursePrice,
                            paymentMethod: paymentData.paymentMethod,
                            email: paymentData.email,
                            name: paymentData.name,
                            enrollmentType: isCompanyEnroll ? "company" : "individual",
                        }
                    });
                } catch (err) {
                    alert(err.message);
                } finally {
                    setIsProcessing(false)
                }
                return;
            }

            // ✅ ============================================================
            // ✅ BANK TRANSFER FLOW (INDIVIDUAL / EXISTING COMPANY LINK)
            // ✅ ============================================================
            setTriggerValidation(true);
            if (!isPaymentValid) return;

            setIsProcessing(true)
            try {
                let studentId = localStorage.getItem("enrollId");
                let slipUrl = "";

                if (!studentId) {
                    const formData = new FormData();
                    formData.append("name", paymentData.name);
                    formData.append("email", paymentData.email);
                    formData.append("phone", paymentData.phone);
                    formData.append("paymentMethod", paymentData.paymentMethod);
                    formData.append("transactionId", paymentData.transactionId || "");
                    if (paymentData.paymentSlip) {
                        formData.append("paymentSlip", paymentData.paymentSlip);
                    }
                    formData.append("courseId", selectedCourse?._id);
                    formData.append("sessionDate", selectedSession?.date);
                    formData.append("startTime", selectedSession?.startTime);
                    formData.append("endTime", selectedSession?.endTime);
                    formData.append("enrollmentType", isCompanyEnroll ? "company" : enrollmentType);
                    if (tokenData?.companyId) formData.append("companyId", tokenData.companyId);
                    else if (enrollId) formData.append("companyId", enrollId);

                    const res = await fetch(`${API_URL}/api/enroll/enrollment`, {
                        method: "POST",
                        body: formData,
                    });
                    const data = await res.json();
                    studentId = data._id;
                    localStorage.setItem("enrollId", studentId);
                    slipUrl = data.courses?.[0]?.slipUrl || "";
                }

                // ✅ Token use — company link வழியா வந்தா
                const token = searchParams.get("token")
                if (token) {
                    await fetch(`${API_URL}/api/course-links/use/${token}`, {
                        method: "PATCH"
                    })
                }

                const flowId = localStorage.getItem("flowId");
                if (!flowId) await createFlow(slipUrl);
                await sendBookingEmail();

                navigate("/booking-success", {
                    state: {
                        selectedCourse,
                        courseDate: selectedSession?.date,
                        courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                        coursePrice,
                        paymentMethod: paymentData.paymentMethod,
                        email: paymentData.email,
                        name: paymentData.name,
                        enrollmentType: isCompanyEnroll ? "company" : "individual",
                    }
                });
            } catch (err) {
                alert(err.message);
            } finally {
                setIsProcessing(false)
            }
            return;
        }

        // ✅ ============================================================
        // ✅ STEP 4 ENROLLMENT FORM SUBMISSION
        // ✅ ============================================================
        if (step === 4) {
            if (enrollSection === 5) {
                if (!enrollRef.current) return;
                const error = await enrollRef.current.submitForm();
                if (error) { alert(error); return; }
                navigate("/booking-success", {
                    state: { email: paymentData.email || userDetails.email }
                });
                return;
            }
            setEnrollSection(prev => prev + 1);
            return;
        }

        // ✅ ============================================================
        // ✅ STEP NAVIGATION
        // ✅ ============================================================
        if (isCompanyEnroll && step === 2) {
            setStep(3);
        } else if (step < totalSteps) {
            setStep(prev => prev + 1);
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [step])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [enrollSection])

    // ✅ Token loading screen
    if (tokenLoading) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <p>Validating your enrollment link...</p>
            </div>
        </section>
    )

    // ✅ Token expired screen
    if (tokenError === "expired") return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
                <h2 style={{ color: "#dc2626", marginBottom: 8 }}>Link Expired</h2>
                <p style={{ color: "#666", marginBottom: 4 }}>
                    All enrollment slots for this course have been filled.
                </p>
                <p style={{ color: "#666" }}>
                    Please contact your company administrator for assistance.
                </p>
            </div>
        </section>
    )

    // ✅ Token invalid screen
    if (tokenError === "invalid") return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
                <h2 style={{ color: "#dc2626", marginBottom: 8 }}>Invalid Link</h2>
                <p style={{ color: "#666" }}>This enrollment link is not valid.</p>
            </div>
        </section>
    )

    if (enrollmentLinkLoading) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <p>Validating your enrollment link...</p>
            </div>
        </section>
    )

    if (enrollmentLinkError) return (
        <section className="enroll-page">
            <div className="enroll-card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
                <h2 style={{ color: "#dc2626", marginBottom: 8 }}>Enrollment Link Error</h2>
                <p style={{ color: "#666" }}>{enrollmentLinkError}</p>
            </div>
        </section>
    )

    if (isLoading) return <div>Loading...</div>;

    return (
        <section className="enroll-page">

            {step !== 3 && (
                <>
                    <h1 className="title">Book Your Course !</h1>
                    <p className="subtitle">Complete all steps to book your course</p>
                </>
            )}

            <div className="enroll-card">

                <p className="home-pg-btn" style={{ width: "fit-content", padding: "10px 20px" }} onClick={() => navigate("/")}>
                    Back to Home
                </p>

                {step !== 3 && (
                    <div className="stepper">
                        <div className="stepper-wo-pbar">
                            <div className={`step ${step >= 1 ? "active" : ""}`}>📖</div>
                            {(enrollmentType === "individual" || enrollmentType === "agent") && (
                                <>
                                    <div className={`step ${step >= 2 ? "active" : ""}`}>{isEnrollmentLink ? "👤" : "💳"}</div>
                                    <div className={`step ${step >= 3 ? "active" : ""}`}>📋</div>
                                    <div className={`step ${step >= 4 ? "active" : ""}`}>📄</div>
                                </>
                            )}
                            {enrollmentType === "company" && (
                                <div className={`step ${step >= 2 ? "active" : ""}`}>💳</div>
                            )}
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <CourseSelection
                        enrollmentType={enrollmentType}
                        setEnrollmentType={setEnrollmentType}
                        selectedSession={selectedSession}
                        setSelectedSession={setSelectedSession}
                        selectedCourse={selectedCourse}
                        setSelectedCourse={setSelectedCourse}
                        hideEnrollmentType={hideEnrollmentType}
                        selectedCourses={selectedCourses}
                        setSelectedCourses={setSelectedCourses}
                        isCompanyEnroll={isCompanyEnroll}
                        tokenData={tokenData}  // ✅ Pass token data to pre-select course
                    />
                )}

                {step === 2 && (
                    <Payment
                        selectedCourse={selectedCourse}
                        selectedCourses={selectedCourses}
                        isCompany={isCompany}
                        coursePrice={coursePrice}
                        setUserDetails={setUserDetails}
                        enrollmentType={enrollmentType}
                        setEnrollmentType={setEnrollmentType}
                        selectedSession={selectedSession}
                        setSelectedSession={setSelectedSession}
                        setIsValid={setIsPaymentValid}
                        triggerValidation={triggerValidation}
                        isCompanyEnroll={isCompanyEnroll}
                        setPaymentData={setPaymentData}
                        onEmailStatusChange={setIsEmailTaken}
                        onCardPayment={(ref) => {
                            cardPaymentRef.current = ref
                            setActivePaymentMethod(ref.paymentMethod)
                        }}
                        isExistingCompany={false}
                        initialPaymentData={isStudentPortalAutofill ? loggedInUser : (isDashboardCompany ? companyUser : {})}
                        isEnrollmentLink={isEnrollmentLink}
                        shouldAutofill={isStudentPortalAutofill}
                        tokenData={tokenData}
                        enrollmentLinkData={enrollmentLinkData}
                    />
                )}

                {step === 3 && (
                    <CourseSelectionSuccess enrollmentData={{
                        selectedCourse,
                        courseDate: selectedSession?.date,
                        courseTime: `${selectedSession?.startTime} - ${selectedSession?.endTime}`,
                        coursePrice,
                        paymentMethod: paymentData.paymentMethod,
                        email: paymentData.email,
                        name: paymentData.name,
                    }} />
                )}

                <div className={`next-wrapper ${step > 1 ? "has-prev" : ""}`}>

                    {step > 1 && step !== 3 && (
                        <button
                            className="prev-btn"
                            disabled={isProcessing || (step === 4 && enrollSection === 1)}
                            onClick={() => {
                                if (step === 4) {
                                    if (enrollSection > 1) setEnrollSection(prev => prev - 1);
                                    return;
                                }
                                setStep(prev => prev - 1);
                            }}
                        >
                            Previous
                        </button>
                    )}

                    {step !== 3 && (
                        <button
                            className="next-btn"
                            disabled={
                                isProcessing ||
                                (step === 1 && !isCompany && !isCompanyEnroll && !selectedSession?._id) ||
                                (step === 1 && isCompanyEnroll && !selectedSession?._id) ||
                                (step === 1 && isCompany && !isCompanyEnroll && selectedCourses.length === 0) ||
                                (step === 1 && isCompany && !isCompanyEnroll && selectedCourses.some(sc => !sc.session?._id)) ||
                                (step === 2 && isEmailTaken)
                            }
                            onClick={handleNext}
                        >
                            {getNextLabel()}
                        </button>
                    )}

                </div>

            </div>

            {isProcessing && (
                <Loading
                    message="Processing your payment"
                    sub="Please wait, do not close this page"
                />
            )}

        </section>
    );
}

export default BookNow;