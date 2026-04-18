import "../../styles/EnrollmentSection2.css"

function EnrollmentSection2({ data, setData, prev, next, userId }) {

    const set = (key, value) => setData(p => ({ ...p, [key]: value }))

    const handleFileUpload = async (file) => {
        if (!file) return;

        set("staIdFile", file);

        const fd = new FormData();
        fd.append("staIdFile", file);
        fd.append("studentId", data.userId);

        try {
            const res = await fetch("https://api.octosofttechnologies.in/api/enrollment-form/section2-file", {
                method: "POST",
                body: fd
            });
            const result = await res.json();
            if (res.ok) {
                set("staIdFileUrl", result.staIdFileUrl);
            } else {
                alert("File upload failed: " + result.message);
            }
        } catch (err) {
            alert("Upload error: " + err.message);
        }
    }

    return (
        <div className="usi-page">

            <div className="usi-section-header">
                <h2 className="usi-section-header-text">
                    SECTION 2 — UNIQUE STUDENT IDENTIFIER (USI)
                </h2>
            </div>

            <div className="usi-info-card">
                <p className="usi-info-text">
                    From 1 January 2015, an RTO can be prevented from issuing nationally recognised VET
                    certification if you do not provide a USI. If you have not obtained a USI you can apply
                    for it directly. If you already have a USI, provide it below.
                </p>
                <p className="usi-info-text">
                    If you forgot your USI, you can retrieve it from the official USI site.
                </p>
            </div>

            <div className="usi-card">

                <h3 className="usi-card-title">Unique Student Identifier (USI)</h3>

                <div className="usi-input-row">

                    <div className="usi-input-col">
                        <label className="usi-label">Enter your USI</label>
                        <input
                            className="usi-input"
                            placeholder="10-character USI"
                            maxLength={10}
                            value={data.usi || ""}
                            onChange={e => set("usi", e.target.value.toUpperCase())}
                        />
                        <p className="usi-hint">
                            If you don't have one, select "Apply through STA" below.
                        </p>
                    </div>

                    <div className="usi-permission-col">
                        <input
                            type="checkbox"
                            className="usi-permission-checkbox"
                            checked={data.usiPermission || false}
                            onChange={e => set("usiPermission", e.target.checked)}
                            id="usi-permission"
                        />
                        <label htmlFor="usi-permission" className="usi-permission-text">
                            I give permission for Safety Training Academy to access my Unique Student
                            Identifier (USI) for the purpose of recording my results.
                        </label>
                    </div>

                </div>

                <div className="usi-sta-group">
                    <p className="usi-sta-label">
                        USI application through STA (if you do not already have one)
                        <span className="usi-required">*</span>
                    </p>
                    <div className="usi-radio-row">
                        <label className="usi-radio-label">
                            <input
                                type="radio"
                                name="usi-sta"
                                value="no"
                                checked={data.staApplication === "no"}
                                onChange={() => set("staApplication", "no")}
                                className="usi-radio"
                            />
                            No (I will provide my USI)
                        </label>
                        <label className="usi-radio-label">
                            <input
                                type="radio"
                                name="usi-sta"
                                value="yes"
                                checked={data.staApplication === "yes"}
                                onChange={() => set("staApplication", "yes")}
                                className="usi-radio"
                            />
                            Yes (Apply through STA)
                        </label>
                    </div>
                </div>

            </div>

            {data.staApplication === "yes" && (
                <div className="usi-extra-box">

                    <h3 className="usi-extra-title">
                        USI application through STA (if you do not already have one)
                    </h3>

                    <p className="usi-extra-text">
                        If you would like STA to apply for a USI on your behalf, you must authorise us to do so and provide additional information.
                    </p>

                    <div className="usi-field">
                        <label>[Name] — authorises Safety Training Academy to apply your USI *</label>
                        <input
                            className="usi-input"
                            value={data.staAuthoriseName || ""}
                            onChange={e => set("staAuthoriseName", e.target.value)}
                        />
                    </div>

                    <label className="usi-checkbox-row">
                        <input
                            type="checkbox"
                            checked={data.staConsent || false}
                            onChange={e => set("staConsent", e.target.checked)}
                        />
                        I have read and I consent to the collection, use and disclosure of my personal information to create my USI.
                    </label>

                    <div className="usi-row">
                        <div>
                            <label>Town/City of Birth *</label>
                            <input
                                className="usi-input"
                                value={data.staTownOfBirth || ""}
                                onChange={e => set("staTownOfBirth", e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Overseas town or city where you were born *</label>
                            <input
                                className="usi-input"
                                value={data.staOverseasTown || ""}
                                onChange={e => set("staOverseasTown", e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="usi-subtitle">
                        We will also need to verify your identity to create your USI.
                    </p>

                    {/* ✅ Identity verify row */}
                    <div className="usi-row" style={{ alignItems: "flex-start" }}>

                        {/* Dropdown */}
                        <div>
                            <label>Identity Document Type</label>
                            <select
                                className="usi-input"
                                value={data.staIdType || ""}
                                onChange={e => set("staIdType", e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option>Passport</option>
                                <option>Driving Licence</option>
                            </select>
                        </div>

                        {/* Upload + Preview */}
                        <div className="usi-upload-wrapper">
                            <label>Upload ID document <span className="usi-required">*</span></label>

                            {/* Dropzone */}
                            <div
                                className={`usi-dropzone ${(data.staIdFile || data.staIdFileUrl) ? "usi-dropzone-active" : ""}`}
                                onClick={() => document.getElementById("sta-id-input").click()}
                            >
                                {data.staIdFile ? (
                                    <p className="usi-file-name">✅ {data.staIdFile.name}</p>
                                ) : data.staIdFileUrl ? (
                                    <p className="usi-file-name">✅ Already uploaded</p>
                                ) : (
                                    <>
                                        <span className="usi-dropzone-arrow">↑</span>
                                        <p className="usi-dropzone-text">Click to upload</p>
                                        <p className="usi-dropzone-hint">PDF, JPG, PNG (max 5MB)</p>
                                    </>
                                )}
                            </div>

                            <input
                                id="sta-id-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ display: "none" }}
                                onChange={e => handleFileUpload(e.target.files[0])}
                            />

                            {/* ✅ Preview + X */}
                            {(data.staIdFile || data.staIdFileUrl) && (
                                <div className="usi-file-preview">

                                    <button
                                        className="usi-remove-btn"
                                        onClick={async () => {
                                            const fileUrl = data.staIdFileUrl

                                            // ✅ Local state clear
                                            set("staIdFile", null)
                                            set("staIdFileUrl", null)
                                            document.getElementById("sta-id-input").value = ""

                                            // ✅ Backend delete
                                            if (fileUrl) {
                                                try {
                                                    await fetch("https://api.octosofttechnologies.in/api/enrollment-form/section2-file", {
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
                                    >✕</button>

                                    {data.staIdFile ? (
                                        data.staIdFile.type === "application/pdf" ? (
                                            <p className="usi-preview-pdf">📄 {data.staIdFile.name}</p>
                                        ) : (
                                            <img
                                                src={URL.createObjectURL(data.staIdFile)}
                                                alt="ID Preview"
                                                className="usi-preview-img"
                                            />
                                        )
                                    ) : data.staIdFileUrl?.endsWith(".pdf") ? (
                                        <a
                                            href={data.staIdFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="usi-preview-pdf"
                                        >
                                            📄 View Document
                                        </a>
                                    ) : (
                                        <img
                                            src={data.staIdFileUrl}
                                            alt="ID Preview"
                                            className="usi-preview-img"
                                        />
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default EnrollmentSection2