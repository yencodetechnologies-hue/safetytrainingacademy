import { useState, useEffect } from "react";
import { useFormik } from "formik"
import axios from "axios"
import "../../styles/CreateCourseModal.css";
import DynamicField from "../DynamicField";
import { API_URL } from "../../data/service";

function CreateCourseModal({ close, categories, refreshCourses, editCourse }) {

    const [activeTab, setActiveTab] = useState("basic")
    const [descriptions, setDescriptions] = useState([""]);
    const [trainingOverview, setTrainingOverview] = useState([""]);
    const [vocationalOutcome, setVocationalOutcome] = useState([""]);
    const [feesCharges, setFeesCharges] = useState([""]);
    const [optionalCharges, setOptionalCharges] = useState([""]);
    const [outcomePoint, setOutcomePoint] = useState([""]);
    const [requirements, setRequirements] = useState([""]);
    const [pathways, setPathways] = useState([""]);
    const [experienceEnabled, setExperienceEnabled] = useState(false)
    const [comboEnabled, setComboEnabled] = useState(false)
    const [withExpPrice, setWithExpPrice] = useState("")
    const [withExpOriginal, setWithExpOriginal] = useState("")
    const [withoutExpPrice, setWithoutExpPrice] = useState("")
    const [withoutExpOriginal, setWithoutExpOriginal] = useState("")
    const [imageType, setImageType] = useState("url")
    const [imageFile, setImageFile] = useState(null)
    const [comboDescription, setComboDescription] = useState("")
    const [comboPrice, setComboPrice] = useState("")
    const [comboDuration, setComboDuration] = useState("")

    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            courseCode: editCourse?.courseCode || "",
            title: editCourse?.title || "",
            category: editCourse?.category || "",
            duration: editCourse?.duration || "",
            certificateValidity: editCourse?.certificateValidity || "",
            deliveryMethod: editCourse?.deliveryMethod || "",
            location: editCourse?.location || "",
            courseImage: editCourse?.image || "",
            originalPrice: editCourse?.originalPrice || "",
            sellingPrice: editCourse?.sellingPrice || "",
            slblStrikePrice: editCourse?.slblStrikePrice || "",
            slblPrice: editCourse?.slblPrice || "",

        },
        onSubmit: async (values) => {

            const formData = new FormData()

            // normal fields
            formData.append("courseCode", values.courseCode)
            formData.append("title", values.title)
            formData.append("category", values.category)
            formData.append("duration", values.duration)
            formData.append("certificateValidity", values.certificateValidity)
            formData.append("deliveryMethod", values.deliveryMethod)
            formData.append("location", values.location)

            formData.append("originalPrice", values.originalPrice)
            formData.append("sellingPrice", values.sellingPrice)
            formData.append("slblStrikePrice", values.slblStrikePrice)
            formData.append("slblPrice", values.slblPrice)

            // arrays convert to string
            formData.append("description", JSON.stringify(descriptions))
            formData.append("trainingOverview", JSON.stringify(trainingOverview))
            formData.append("vocationalOutcome", JSON.stringify(vocationalOutcome))
            formData.append("feesCharges", JSON.stringify(feesCharges))
            formData.append("optionalCharges", JSON.stringify(optionalCharges))
            formData.append("outcomePoints", JSON.stringify(outcomePoint))

            formData.append("requirements", JSON.stringify(requirements))
            formData.append("pathways", JSON.stringify(pathways))

            formData.append("experienceBasedBooking", experienceEnabled)

            formData.append("withExperiencePrice", withExpPrice)
            formData.append("withExperienceOriginal", withExpOriginal)
            formData.append("withoutExperiencePrice", withoutExpPrice)
            formData.append("withoutExperienceOriginal", withoutExpOriginal)
            formData.append("comboEnabled", comboEnabled)
            formData.append("comboDescription", comboDescription)
            formData.append("comboPrice", comboPrice)
            formData.append("comboDuration", comboDuration)

            // image logic
            if (imageType === "upload" && imageFile) {
                formData.append("image", imageFile)
            }

            if (imageType === "url") {
                formData.append("image", values.courseImage)
            }

            try {

                if (editCourse) {

                    await axios.put(
                        `https://api.octosofttechnologies.in/api/courses/${editCourse._id}`,
                        formData
                    )

                } else {

                    await axios.post(
                        `https://api.octosofttechnologies.in/api/courses`,
                        formData
                    )

                }

                refreshCourses()
                close()

            } catch (err) {
                console.log(err)
            }

        }
    })
    useEffect(() => {
        if (editCourse) {
            setDescriptions(editCourse.description || [""]);
            setTrainingOverview(editCourse.trainingOverview || [""]);
            setVocationalOutcome(editCourse.vocationalOutcome || [""]);
            setFeesCharges(editCourse.feesCharges || [""]);
            setOptionalCharges(editCourse.optionalCharges || [""]);
            setOutcomePoint(editCourse.outcomePoints || [""]);
            setRequirements(editCourse.requirements || [""]);
            setPathways(editCourse.pathways || [""]);

            setExperienceEnabled(editCourse.experienceBasedBooking || false);

            setWithExpPrice(editCourse.withExperiencePrice || "");
            setWithExpOriginal(editCourse.withExperienceOriginal || "");

            setWithoutExpPrice(editCourse.withoutExperiencePrice || "");
            setWithoutExpOriginal(editCourse.withoutExperienceOriginal || "");
            setComboEnabled(editCourse.comboEnabled || false);
            setComboDescription(editCourse.comboDescription || "");
            setComboPrice(editCourse.comboPrice || "");
            setComboDuration(editCourse.comboDuration || "");
        }
    }, [editCourse]);

    return (

        <div className="modal-overlay">

            <div className="course-modal">

                <div className="modal-header">

                    <div>
                        <h2>Create New Course</h2>
                        <p>Set up a new course with comprehensive details</p>
                    </div>

                    <button onClick={close}>✕</button>

                </div>

                {/* TABS */}

                <div className="modal-tabs">

                    <button
                        className={activeTab === "basic" ? "active" : ""}
                        onClick={() => setActiveTab("basic")}
                    >
                        Basic Info
                    </button>

                    <button
                        className={activeTab === "details" ? "active" : ""}
                        onClick={() => setActiveTab("details")}
                    >
                        Details
                    </button>

                    <button
                        className={activeTab === "requirements" ? "active" : ""}
                        onClick={() => setActiveTab("requirements")}
                    >
                        Requirements
                    </button>

                    <button
                        className={activeTab === "pathways" ? "active" : ""}
                        onClick={() => setActiveTab("pathways")}
                    >
                        Pathways
                    </button>

                    <button
                        className={activeTab === "combo" ? "active" : ""}
                        onClick={() => setActiveTab("combo")}
                    >
                        Combo Offer
                    </button>

                </div>

                {/* TAB CONTENT */}
                <form onSubmit={formik.handleSubmit}>
                    <div className="modal-body">


                        {activeTab === "basic" && (

                            <div className="form-grid">

                                <div className="course-form">

                                    <div className="form-group">
                                        <label>Course Code (Optional)</label>
                                        <input type="text" placeholder="e.g., RIIHAN309F"
                                            name="courseCode"
                                            value={formik.values.courseCode}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category (Optional)</label>
                                        <select
                                            name="category"
                                            value={formik.values.category}
                                            onChange={formik.handleChange}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Short Courses">Short Courses</option>
                                            <option value="Earthmoving Courses">Earthmoving Courses</option>
                                            <option value="Working in Confined Space Courses">Working in Confined Space Courses</option>
                                            <option value="First Aid Courses">First Aid Courses</option>
                                            <option value="Certificate Courses">Certificate Courses</option>
                                            <option value="Technical Courses">Technical Courses</option>
                                            <option value="Traffic Control Courses">Traffic Control Courses</option>
                                            <option value="Asbestos Removal Courses">Asbestos Removal Courses</option>
                                        </select>
                                    </div>
                                    <p className="pricing">Pricing </p>
                                    <div className="form-group">
                                        <label>Original Price ($)</label>
                                        <input type="number" placeholder="e.g., 1200"
                                            name="originalPrice"
                                            value={formik.values.originalPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Selling Price ($)</label>
                                        <input type="number" placeholder="e.g. 1050"
                                            name="sellingPrice"
                                            value={formik.values.sellingPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    <p className="pricing">SL + BL pricing </p>
                                    <div className="form-group">
                                        <label>SL + BL pricing Strike Through Price ($)</label>
                                        <input type="number" placeholder="e.g., 1200"
                                            name="strikeThroughPrice"
                                            value={formik.values.strikeThroughPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>SL + BL price ($)</label>
                                        <input type="number" placeholder="e.g. 1050"
                                            name="slblPrice"
                                            value={formik.values.slblPrice}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="course-form">
                                    <div className="form-group">
                                        <label>Course Title (Optional)</label>
                                        <input type="text" placeholder="e.g., Conduct Telescopic mate"
                                            name="title"
                                            value={formik.values.title}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (Optional)</label>
                                        <input type="text" placeholder="e.g., 1 Day Course"
                                            name="duration"
                                            value={formik.values.duration}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Certificate Validity (Optional)</label>
                                        <input type="text" placeholder="e.g., 3 years"
                                            name="certificateValidity"
                                            value={formik.values.certificateValidity}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Delivery Method</label>
                                        <input type="text" placeholder="e.g., Online, Classroom"
                                            name="deliveryMethod"
                                            value={formik.values.deliveryMethod}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" placeholder="e.g., New York, London"
                                            name="location"
                                            value={formik.values.location}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Course Image</label>
                                        <div className="image-upload-options">

                                            <button
                                                type="button"
                                                className={imageType === "upload" ? "active" : ""}
                                                onClick={() => setImageType("upload")}
                                            >
                                                Upload Image
                                            </button>

                                            <button
                                                type="button"
                                                className={imageType === "url" ? "active" : ""}
                                                onClick={() => setImageType("url")}
                                            >
                                                URL
                                            </button>

                                        </div>
                                        {imageFile && (
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                style={{ width: "120px", borderRadius: "8px", marginTop: "10px" }}
                                            />
                                        )}
                                    </div>
                                    <div className="form-group">
                                        {imageType === "upload" && (

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files[0])}
                                            />

                                        )}

                                        {imageType === "url" && (

                                            <input
                                                type="text"
                                                placeholder="https://example.com/image.jpg"
                                                name="courseImage"
                                                value={formik.values.courseImage}
                                                onChange={formik.handleChange}
                                            />

                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "details" && (
                            <div className="details-section">
                                <div className="form-group">
                                    <DynamicField
                                        label="Course Description"
                                        placeholder="Course Description..."
                                        values={descriptions}
                                        setValues={setDescriptions}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Training Overview"
                                        placeholder="Training Overview..."
                                        values={trainingOverview}
                                        setValues={setTrainingOverview}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Vocational Outcome"
                                        placeholder="Vocational Outcome..."
                                        values={vocationalOutcome}
                                        setValues={setVocationalOutcome}
                                    />
                                </div>
                                <div className="form-group">
                                    <DynamicField
                                        label="Fees and Charges"
                                        placeholder="Fees and Charges..."
                                        values={feesCharges}
                                        setValues={setFeesCharges}
                                    />
                                </div>

                                <div className="form-group">
                                    <DynamicField
                                        label="Optional Charges"
                                        placeholder="Optional Charges..."
                                        values={optionalCharges}
                                        setValues={setOptionalCharges}
                                    />
                                </div>

                                <div className="form-group">
                                    <DynamicField
                                        label="Outcome Point"
                                        placeholder="Outcome Point..."
                                        values={outcomePoint}
                                        setValues={setOutcomePoint}
                                    />
                                </div>

                            </div>
                        )}

                        {activeTab === "requirements" && (
                            <div className="requirements-section">

                                <DynamicField
                                    label="Course Requirement"
                                    placeholder="Course Requirement..."
                                    values={requirements}
                                    setValues={setRequirements}
                                />
                                <div className="handbook-card">

                                    <div className="handbook-header">
                                        <span className="icon">📄</span>
                                        <h3>Upload handbook (Optional)</h3>
                                    </div>

                                    <p className="handbook-desc">
                                        Upload a PDF or enter a URL. This handbook is shown on the course details page with a view option.
                                    </p>

                                    <label>Handbook title</label>
                                    <input type="text" placeholder="e.g., Code of Practice Managing the Risk..." />

                                    <label>Upload handbook</label>
                                    <div className="upload-btn">
                                        <input type="file" accept="application/pdf" />
                                        <span>⬆ Choose PDF</span>
                                    </div>

                                    <div className="divider">
                                        <span></span>
                                        <p>OR</p>
                                        <span></span>
                                    </div>

                                    <label>Enter handbook URL</label>
                                    <input type="text" placeholder="https://... (external link)" />

                                </div>

                            </div>

                        )}

                        {activeTab === "pathways" && (
                            <div className="details-section">
                                <DynamicField
                                    label="Pathways"
                                    placeholder="Pathways..."
                                    values={pathways}
                                    setValues={setPathways}
                                />

                            </div>

                        )}


                        {activeTab === "combo" && (

                            <div className="combo-section">
                                <div className="combo-card experience">

                                    <div className="combo-header">
                                        <h3>Experience-Based Pricing</h3>
                                        <span className="badge green">Booking Options</span>
                                    </div>

                                    <p className="combo-desc">
                                        Enable different pricing for students with and without prior experience
                                    </p>

                                    <label className="checkbox-row">

                                        <input
                                            type="checkbox"
                                            checked={experienceEnabled}
                                            onChange={(e) => setExperienceEnabled(e.target.checked)}
                                        />
                                        Enable Experience-Based Booking
                                    </label>
                                    {experienceEnabled && (

                                        <div className="experience-pricing">

                                            <div className="experience-card">

                                                <h3>✓ Book With Experience</h3>

                                                <label>Price ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 400"
                                                    value={withExpPrice}
                                                    onChange={(e) => setWithExpPrice(e.target.value)}
                                                />

                                                <label>Original Price ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 500"
                                                    value={withExpOriginal}
                                                    onChange={(e) => setWithExpOriginal(e.target.value)}
                                                />

                                            </div>


                                            <div className="experience-card no-exp">

                                                <h3>✕ Book Without Experience</h3>

                                                <label>Price ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 620"
                                                    value={withoutExpPrice}
                                                    onChange={(e) => setWithoutExpPrice(e.target.value)}
                                                />

                                                <label>Original Price ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 800"
                                                    value={withoutExpOriginal}
                                                    onChange={(e) => setWithoutExpOriginal(e.target.value)}
                                                />

                                            </div>
                                            <div className="preview-box">

                                                <h3>Preview</h3>

                                                <div className="preview-grid">

                                                    <div className="preview-card green">

                                                        <p className="preview-price">
                                                            {withExpOriginal && <span>${withExpOriginal}</span>}
                                                            ${withExpPrice || 0}
                                                        </p>

                                                        <p>Book With Experience</p>

                                                    </div>


                                                    <div className="preview-card red">

                                                        <p className="preview-price">
                                                            {withoutExpOriginal && <span>${withoutExpOriginal}</span>}
                                                            ${withoutExpPrice || 0}
                                                        </p>

                                                        <p>Book Without Experience</p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </div>
                                <div className="combo-card premium">

                                    <div className="combo-header">
                                        <h3>Combo Package Offer</h3>
                                        <span className="badge purple">Premium</span>
                                    </div>

                                    <p className="combo-desc">
                                        Create a combo package offer by bundling this course with another course at a discounted price
                                    </p>

                                    <label className="checkbox-row">
                                        <input type="checkbox"
                                            checked={comboEnabled}
                                            onChange={(e) => setComboEnabled(e.target.checked)}
                                        />
                                        Enable Combo Package Offer
                                    </label>
                                    {comboEnabled && (
                                        <div className="combo-expanded">

                                            <div className="form-group">
                                                <label>Combo Description (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., RIIWHS204E + RIIWHS202E Enter and work in confined spaces"
                                                    value={comboDescription}
                                                    onChange={(e) => setComboDescription(e.target.value)}
                                                />
                                                <small>Describe what courses are included in this combo package</small>
                                            </div>

                                            <div className="combo-price-duration-row">

                                                <div className="form-group">
                                                    <label>Combo Price ($) (Optional)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 350"
                                                        value={comboPrice}
                                                        onChange={(e) => setComboPrice(e.target.value)}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Combo Duration (Optional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., 2 Days Training"
                                                        value={comboDuration}
                                                        onChange={(e) => setComboDuration(e.target.value)}
                                                    />
                                                </div>

                                            </div>

                                            <div className="preview-box">
                                                <h3>Combo Preview</h3>
                                                <p><strong>Package:</strong> {comboDescription || "N/A"}</p>
                                                <p><strong>Price:</strong> ${comboPrice || 0}</p>
                                                <p><strong>Duration:</strong> {comboDuration || "N/A"}</p>
                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button className="create-btn" type="submit">
                            {editCourse ? "Update Course" : "Create Course"}
                        </button>
                        <button className="cancel-btn" onClick={close}>
                            Cancel
                        </button>
                    </div>
                </form>

            </div>

        </div >

    )

}

export default CreateCourseModal