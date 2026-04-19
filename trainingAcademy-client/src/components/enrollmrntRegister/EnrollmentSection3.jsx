import { useState } from "react"
import "../../styles/EnrollmentSection3.css"
import { API_URL } from "../../data/service"

const EDUCATION_LEVELS = [
    { value: "12", label: "12 — Year 12 or equivalent" },
    { value: "11", label: "11 — Year 11 or equivalent" },
    { value: "10", label: "10 — Year 10 or equivalent" },
    { value: "09", label: "09 — Year 9 or equivalent" },
    { value: "08", label: "08 — Year 8 or below" },
    { value: "never", label: "Never attended school" },
]

const QUALIFICATION_LEVELS = [
    "Bachelor Degree or Higher",
    "Advanced Diploma / Associate Degree",
    "Diploma",
    "Certificate IV",
    "Certificate III",
    "Certificate II",
    "Certificate I",
    "Other / Overseas",
]

const EMPLOYMENT_STATUSES = [
    { value: "full-time", label: "Full-time employee" },
    { value: "unemployed-seeking", label: "Unemployed — seeking work" },
    { value: "part-time", label: "Part-time employee" },
    { value: "not-employed", label: "Not employed — not seeking" },
    { value: "self-employed", label: "Self-employed" },
    { value: "casual", label: "Casual employee" },
]

const TRAINING_REASONS = [
    { value: "get-job", label: "To get a job" },
    { value: "entry-course", label: "Entry to another course" },
    { value: "promotion", label: "Promotion" },
    { value: "personal-dev", label: "Personal development" },
    { value: "extra-skills", label: "Extra skills" },
    { value: "other", label: "Other" },
]

function EnrollmentSection3({ data, setData, prev, next }) {

    const set = (key, value) => setData(p => ({ ...p, [key]: value }))

    const toggleQualLevel = (level) => {
        const current = data.qualificationLevels || []
        if (current.includes(level)) {
            set("qualificationLevels", current.filter(l => l !== level))
        } else {
            set("qualificationLevels", [...current, level])
        }
    }

    const neverAttended = data.educationLevel === "never"
    const schoolNotAustralia = !data.schoolInAustralia
    const qualYes = data.hasQualifications === "yes"
    const reasonOther = data.trainingReason === "other"

    const handleNext = () => {
        if (!data.employmentStatus) {
            alert("Please select your employment status.")
            return
        }
        if (!data.trainingReason) {
            alert("Please select your reason for undertaking training.")
            return
        }
        if (reasonOther && !data.trainingReasonOther?.trim()) {
            alert("Please provide details for 'Other' reason.")
            return
        }
        next()
    }


    return (
        <div className="s3-page">

            {/* SECTION HEADER */}
            <div className="s3-section-header">
                <h2 className="s3-section-header-text">
                    SECTION 3 — EDUCATION AND EMPLOYMENT INFORMATION
                </h2>
            </div>

            {/* AVETMISS INFO */}
            <div className="s3-card">
                <h4 className="s3-card-title">AVETMISS Data Collection</h4>
                <p className="s3-info-text">
                    Information collected in this section is used for National reporting and planning. Please complete all sections.
                </p>
            </div>

            {/* PRIOR EDUCATION */}
            <div className="s3-card">
                <h4 className="s3-card-title">PRIOR EDUCATION</h4>
                <p className="s3-subtitle">What was your highest completed level at school?</p>

                <div className="s3-radio-grid">
                    {EDUCATION_LEVELS.map(level => (
                        <label key={level.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-education"
                                value={level.value}
                                checked={data.educationLevel === level.value}
                                onChange={() => set("educationLevel", level.value)}
                                className="s3-radio"
                            />
                            {level.label}
                        </label>
                    ))}
                </div>

                <p className="s3-hint">
                    Prior education is optional. Year completed is not required if you never attended school.
                </p>

                {/* Never attended — show message */}
                {neverAttended && (
                    <p className="s3-hint" style={{ marginTop: 8 }}>
                        Year completed and school details are not required.
                    </p>
                )}

                {/* School details — hide if never attended */}
                {!neverAttended && (
                    <>
                        <div className="s3-divider" />

                        <div className="s3-row-2">
                            <div className="s3-field">
                                <label className="s3-label">
                                    Year completed <span className="s3-required">*</span>
                                </label>
                                <input
                                    className="s3-input"
                                    placeholder="e.g. 2010"
                                    maxLength={4}
                                    value={data.yearCompleted || ""}
                                    onChange={e => set("yearCompleted", e.target.value)}
                                />
                            </div>
                            <div className="s3-field">
                                <label className="s3-label">Name of School (optional)</label>
                                <input
                                    className="s3-input"
                                    value={data.schoolName || ""}
                                    onChange={e => set("schoolName", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* School in Australia checkbox */}
                        <label className="s3-checkbox-label">
                            <input
                                type="checkbox"
                                checked={data.schoolInAustralia !== false}
                                onChange={e => set("schoolInAustralia", e.target.checked)}
                            />
                            School was in Australia
                        </label>
                        <p className="s3-hint" style={{ marginTop: 4 }}>
                            Uncheck if the school was not in Australia.
                        </p>

                        {/* Australia → State + Postcode */}
                        {!schoolNotAustralia && (
                            <div className="s3-row-2" style={{ marginTop: 12 }}>
                                <div className="s3-field">
                                    <label className="s3-label">State (optional)</label>
                                    <input
                                        className="s3-input"
                                        value={data.schoolState || ""}
                                        onChange={e => set("schoolState", e.target.value)}
                                    />
                                </div>
                                <div className="s3-field">
                                    <label className="s3-label">Postcode (optional)</label>
                                    <input
                                        className="s3-input"
                                        value={data.schoolPostcode || ""}
                                        onChange={e => set("schoolPostcode", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Overseas → Country */}
                        {schoolNotAustralia && (
                            <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                                <label className="s3-label">
                                    Country (if overseas) <span className="s3-required">*</span>
                                </label>
                                <input
                                    className="s3-input-full"
                                    value={data.schoolCountry || ""}
                                    onChange={e => set("schoolCountry", e.target.value)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* QUALIFICATIONS */}
            <div className="s3-card">
                <h4 className="s3-card-title">QUALIFICATIONS</h4>
                <p className="s3-subtitle">Do you have post-secondary or vocational/trade qualifications?</p>

                <div className="s3-radio-row">
                    <label className="s3-radio-label">
                        <input
                            type="radio"
                            name="s3-qualifications"
                            value="yes"
                            checked={data.hasQualifications === "yes"}
                            onChange={() => set("hasQualifications", "yes")}
                            className="s3-radio"
                        />
                        Yes — I will provide evidence
                    </label>
                    <label className="s3-radio-label">
                        <input
                            type="radio"
                            name="s3-qualifications"
                            value="no"
                            checked={data.hasQualifications === "no"}
                            onChange={() => set("hasQualifications", "no")}
                            className="s3-radio"
                        />
                        No
                    </label>
                </div>

                {/* Qualification expand */}
                {qualYes && (
                    <div className="s3-qual-box">
                        <h5 className="s3-qual-title">Qualification Level(s)</h5>

                        <div className="s3-checkbox-grid">
                            {QUALIFICATION_LEVELS.map(level => (
                                <label key={level} className="s3-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={(data.qualificationLevels || []).includes(level)}
                                        onChange={() => toggleQualLevel(level)}
                                    />
                                    {level}
                                </label>
                            ))}
                        </div>

                        <div className="s3-field s3-field-full" style={{ marginTop: 16 }}>
                            <label className="s3-label">Qualification details (optional)</label>
                            <textarea
                                className="s3-textarea"
                                rows={3}
                                value={data.qualificationDetails || ""}
                                onChange={e => set("qualificationDetails", e.target.value)}
                            />
                        </div>

                        <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                            <label className="s3-label">Upload qualification evidence</label>

                            {/* ✅ Multiple files support */}
                            <input
                                type="file"
                                className="s3-file-input"
                                accept=".jpg,.jpeg,.png,.pdf"
                                multiple
                                onChange={async (e) => {
                                    const file = e.target.files[0]  // single file
                                    if (!file) return

                                    set("qualificationFile", file)

                                    const fd = new FormData()
                                    fd.append("studentId", data.userId)
                                    fd.append("qualificationFile", file)
                                    fd.append("qualificationDetails", data.qualificationDetails || "")

                                    const res = await fetch(`https://api.octosofttechnologies.in/api/enrollment-form/section3-file`, {
                                        method: "POST",
                                        body: fd
                                    })
                                    const result = await res.json()
                                    if (res.ok) {
                                        set("qualificationFileUrl", result.qualificationFileUrl)
                                    }
                                }}
                            />

                            <p className="s3-hint">
                                Certificate, Statement of Attainment, Transcript, or overseas equivalent. Multiple files allowed.
                            </p>

                            {/* ✅ Multiple previews */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                                {(data.qualificationFiles || []).map((item, index) => (
                                    <div key={index} style={{ position: "relative" }}>
                                        <button
                                            onClick={() => setData(prev => ({
                                                ...prev,
                                                qualificationFiles: prev.qualificationFiles.filter((_, i) => i !== index)
                                            }))}
                                            style={{ position: "absolute", top: -8, right: -8, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 12 }}
                                        >✕</button>
                                        {item.file?.type === "application/pdf" ? (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>
                                                📄 {item.file.name}
                                            </a>
                                        ) : (
                                            <img
                                                src={item.url || URL.createObjectURL(item.file)}
                                                alt={`Qualification ${index + 1}`}
                                                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* ✅ Saved URLs from DB (page reload) */}
                                {/* ✅ Saved URLs from DB (page reload) */}
                                {!data.qualificationFiles?.length && data.qualificationFileUrl && (
                                    <div style={{ position: "relative", display: "inline-block" }}>
                                        {/* ✅ DELETE BUTTON */}
                                        <button
                                            onClick={async () => {
                                                const fileUrl = data.qualificationFileUrl
                                                set("qualificationFileUrl", null)
                                                set("qualificationFile", null)

                                                if (fileUrl) {
                                                    try {
                                                        await fetch(`https://api.octosofttechnologies.in/api/enrollment-form/section3-file`, {
                                                            method: "DELETE",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                studentId: data.userId,
                                                                fileUrl
                                                            })
                                                        })
                                                    } catch (err) {
                                                        console.error("Delete error:", err)
                                                    }
                                                }
                                            }}
                                            style={{
                                                position: "absolute", top: -8, right: -8,
                                                background: "red", color: "#fff", border: "none",
                                                borderRadius: "50%", width: 20, height: 20,
                                                cursor: "pointer", fontSize: 12, zIndex: 1
                                            }}
                                        >✕</button>
                                        <img
                                            src={data.qualificationFileUrl}
                                            alt="Uploaded qualification"
                                            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EMPLOYMENT STATUS */}
            <div className="s3-card">
                <h4 className="s3-card-title">EMPLOYMENT STATUS</h4>

                <div className="s3-radio-grid">
                    {EMPLOYMENT_STATUSES.map(status => (
                        <label key={status.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-employment"
                                value={status.value}
                                checked={data.employmentStatus === status.value}
                                onChange={() => set("employmentStatus", status.value)}
                                className="s3-radio"
                            />
                            {status.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* EMPLOYMENT DETAILS */}
            <div className="s3-card">
                <h4 className="s3-card-title">EMPLOYMENT DETAILS (if applicable)</h4>

                <div className="s3-row-2">
                    <div className="s3-field">
                        <label className="s3-label">Employer name</label>
                        <input
                            className="s3-input"
                            value={data.employerName || ""}
                            onChange={e => set("employerName", e.target.value)}
                        />
                    </div>
                    <div className="s3-field">
                        <label className="s3-label">Supervisor name</label>
                        <input
                            className="s3-input"
                            value={data.supervisorName || ""}
                            onChange={e => set("supervisorName", e.target.value)}
                        />
                    </div>
                </div>

                <div className="s3-field s3-field-full">
                    <label className="s3-label">Workplace address</label>
                    <input
                        className="s3-input-full"
                        value={data.workplaceAddress || ""}
                        onChange={e => set("workplaceAddress", e.target.value)}
                    />
                </div>

                <div className="s3-row-2">
                    <div className="s3-field">
                        <label className="s3-label">Email</label>
                        <input
                            type="email"
                            className="s3-input"
                            value={data.employerEmail || ""}
                            onChange={e => set("employerEmail", e.target.value)}
                        />
                    </div>
                    <div className="s3-field">
                        <label className="s3-label">Phone</label>
                        <input
                            className="s3-input"
                            value={data.employerPhone || ""}
                            onChange={e => set("employerPhone", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* REASON FOR TRAINING */}
            <div className="s3-card">
                <h4 className="s3-card-title">REASON FOR UNDERTAKING TRAINING / RPL</h4>

                <div className="s3-radio-grid">
                    {TRAINING_REASONS.map(reason => (
                        <label key={reason.value} className="s3-radio-label">
                            <input
                                type="radio"
                                name="s3-reason"
                                value={reason.value}
                                checked={data.trainingReason === reason.value}
                                onChange={() => set("trainingReason", reason.value)}
                                className="s3-radio"
                            />
                            {reason.label}
                        </label>
                    ))}
                </div>

                {/* Other expand */}
                {reasonOther && (
                    <div className="s3-field s3-field-full" style={{ marginTop: 12 }}>
                        <label className="s3-label">
                            Other — details <span className="s3-required">*</span>
                        </label>
                        <input
                            className="s3-input-full"
                            value={data.trainingReasonOther || ""}
                            onChange={e => set("trainingReasonOther", e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* FOOTER */}

        </div>
    )
}

export default EnrollmentSection3