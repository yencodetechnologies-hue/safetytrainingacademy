const EnrollmentForm = require("../models/EnrollmentForm");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const cloudinary = require("../config/cloudinary")

const createEnrollmentForm = async (req, res) => {
  try {
    const data = req.body;
    let { userId, flowId, studentId } = data;

    // ✅ Clean up "null"/"undefined" strings from frontend
    if (userId === "null" || userId === "undefined") userId = null;
    if (flowId === "null" || flowId === "undefined") flowId = null;
    if (studentId === "null" || studentId === "undefined") studentId = null;

    const studentIdToUse = userId || studentId;

    console.log("[EnrollmentForm] createEnrollmentForm called. studentIdToUse:", studentIdToUse, "flowId:", flowId);

    if (!studentIdToUse) {
        return res.status(400).json({ message: "Student ID is missing. Please try logging in again." });
    }

    const idDocumentUrl = req.files?.idDocument?.[0]?.path || null;
    const photoDocumentUrl = req.files?.photoDocument?.[0]?.path || null;
    const signatureUrl = req.files?.signature?.[0]?.path || null;

    // ✅ Use dot notation for qualifications so evidenceUrls is NOT wiped on final submit
    const updateData = {
      studentId: studentIdToUse,

      personalDetails: {
        title: data.title,
        surname: data.surname,
        givenName: data.givenName,
        middleName: data.middleName,
        preferredName: data.preferredName,
        dob: data.dob,
        gender: data.gender,
        email: data.email,
        homePhone: data.homePhone,
        workPhone: data.workPhone,
        mobilePhone: data.mobilePhone,
      },

      address: {
        residential: {
          address: data.residentialAddress,
          suburb: data.suburb,
          state: data.state,
          postcode: data.postcode,
        },
        postal: {
          address: data.postalAddress,
          suburb: data.postalSuburb,
          state: data.postalState,
          postcode: data.postalPostcode,
        }
      },

      emergencyContact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        contactNumber: data.emergencyContact,
        consent: data.emergencyPermission === "yes"
      },

      education: {
        highestLevel: data.educationLevel,
        yearCompleted: data.yearCompleted,
        schoolName: data.schoolName,
        schoolState: data.schoolState,
        schoolPostcode: data.schoolPostcode,
        schoolCountry: data.schoolCountry,
      },

      // ✅ dot notation — evidenceUrls array untouched
      "qualifications.hasQualification": data.hasQualifications === "yes" || data.hasQualifications === "true",
      "qualifications.types": Array.isArray(data.qualificationLevels)
        ? data.qualificationLevels
        : [data.qualificationLevels].filter(Boolean),
      "qualifications.details": data.qualificationDetails || "",
      "qualifications.evidenceUrl": data.qualificationFileUrl || null,

      employment: {
        status: data.employmentStatus,
        details: {
          employerName: data.employerName,
          supervisorName: data.supervisorName,
          address: data.workplaceAddress,
          email: data.employerEmail,
          phone: data.employerPhone
        }
      },

      trainingReason: data.trainingReason,

      language: {
        countryOfBirth: data.countryOfBirth,
        otherLanguage: data.otherLanguage,
        speaksOtherLanguage: data.speaksOtherLanguage,
        indigenousStatus: data.indigenousStatus,
      },

      specialNeeds: {
        hasDisability: data.hasDisability === "yes",
        types: data.disabilityTypes,
        other: data.disabilityNotes
      },

      ...(idDocumentUrl && { idDocumentUrl }),
      ...(photoDocumentUrl && { photoDocumentUrl }),
      ...(signatureUrl && { signatureUrl }),

      studentName: data.studentName,
      declarationDate: data.declarationDate,
      enrollment: {
        units: data.enrolledCourseId ? [data.enrolledCourseId] : []
      },
      enrollmentFormCompleted: true,
      enrollmentFormSubmittedAt: new Date(),
      status: "Approved"
    }

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId: studentIdToUse },
      { $set: updateData },
      { returnDocument: "after", upsert: true }
    )

    // Update EnrollmentFlow as well
    const flowUpdateData = { 
      enrollmentFormId: form._id, 
      currentStep: 5,
      enrollmentStatus: "enrolled" // ✅ Auto-mark as enrolled since form is auto-approved
    };
    
    let flow;
    if (flowId && flowId !== "null" && flowId !== "undefined") {
      console.log("[EnrollmentForm] Updating flow by flowId:", flowId);
      flow = await EnrollmentFlow.findByIdAndUpdate(flowId, flowUpdateData, { new: true });
    } else {
      console.log("[EnrollmentForm] Updating flow by studentId:", studentIdToUse);
      flow = await EnrollmentFlow.findOneAndUpdate(
        { studentId: studentIdToUse },
        flowUpdateData,
        { sort: { createdAt: -1 }, new: true }
      )
    }

    if (!flow) {
      console.warn("[EnrollmentForm] No EnrollmentFlow found to update for student:", studentIdToUse);
    } else {
      console.log("[EnrollmentForm] EnrollmentFlow updated successfully:", flow._id);
    }

    res.status(201).json({ message: "Enrollment form submitted successfully" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const getEnrollmentForms = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const forms = await EnrollmentForm.find(query).sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching forms" });
  }
};

const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await EnrollmentForm.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Also sync with EnrollmentFlow if Approved
    if (status === "Approved" && updated.studentId) {
      try {
        await EnrollmentFlow.findOneAndUpdate(
          { studentId: updated.studentId },
          { $set: { enrollmentStatus: "enrolled" } },
          { sort: { createdAt: -1 } }
        );
        console.log("[EnrollmentForm] Linked EnrollmentFlow marked as 'enrolled' for student:", updated.studentId);
      } catch (flowErr) {
        console.error("[EnrollmentForm] Error syncing flow status:", flowErr);
      }
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const saveSection = async (req, res) => {
  try {
    let { studentId, section, userId, flowId, ...sectionData } = req.body

    // ✅ Clean up "null"/"undefined" strings from frontend
    if (userId === "null" || userId === "undefined") userId = null;
    if (flowId === "null" || flowId === "undefined") flowId = null;
    if (studentId === "null" || studentId === "undefined") studentId = null;

    const studentIdToUse = userId || studentId;

    console.log("[EnrollmentForm] saveSection called. section:", section, "studentId:", studentIdToUse, "flowId:", flowId);

    if (!studentIdToUse) return res.status(400).json({ message: "studentId required" })

    let updateFields = {}

    if (section === "1" || section === 1) {
      updateFields = {
        personalDetails: sectionData.personalDetails,
        address: sectionData.address,
        emergencyContact: sectionData.emergencyContact
      }
    }

    if (section === "2" || section === 2) {
      updateFields = {
        "usi.number": sectionData.usiNumber,
        "usi.permission": sectionData.usiPermission,
        "usi.staApplication": sectionData.staApplication,
        "usi.staAuthoriseName": sectionData.staAuthoriseName,
        "usi.staConsent": sectionData.staConsent,
        "usi.staTownOfBirth": sectionData.staTownOfBirth,
        "usi.staOverseasTown": sectionData.staOverseasTown,
        "usi.staIdType": sectionData.staIdType,
      }
    }

    if (section === "3" || section === 3) {
      // ✅ dot notation — evidenceUrls array untouched
      updateFields = {
        education: sectionData.education,
        "qualifications.hasQualification": sectionData.qualifications?.hasQualification,
        "qualifications.types": sectionData.qualifications?.types,
        "qualifications.details": sectionData.qualifications?.details || "",
        employment: sectionData.employment,
        trainingReason: sectionData.trainingReason,
        trainingReasonOther: sectionData.trainingReasonOther,
      }
    }

    if (section === "4" || section === 4) {
      updateFields = {
        "language.countryOfBirth": sectionData.language?.countryOfBirth,
        "language.otherLanguage": sectionData.language?.otherLanguage,
        "language.speaksOtherLanguage": sectionData.language?.speaksOtherLanguage,
        "language.indigenousStatus": sectionData.language?.indigenousStatus,
        specialNeeds: sectionData.specialNeeds,
      }
    }

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId: studentIdToUse },
      { $set: updateFields },
      { returnDocument: "after", upsert: true }
    )

    res.json({ message: `Section ${section} saved`, form })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const saveSection2File = async (req, res) => {
  try {
    const { studentId } = req.body;
    const staIdFileUrl = req.file?.path || null;

    if (!studentId) return res.status(400).json({ message: "studentId required" });
    if (!staIdFileUrl) return res.status(400).json({ message: "File required" });

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId },
      { $set: { "usi.staIdFileUrl": staIdFileUrl } },
      { returnDocument: "after", upsert: true }
    );

    res.json({ message: "File uploaded", staIdFileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ FIXED: saveSection3File — per-qualification evidence upload
const saveSection3File = async (req, res) => {
  try {
    const { studentId, qualificationDetails, qualificationLevel } = req.body
    const qualificationFileUrl = req.file?.path || null

    if (!studentId) return res.status(400).json({ message: "studentId required" })

    if (qualificationFileUrl && qualificationLevel) {
      // Step 1: Pull existing entry for this level
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        {
          $set: { "qualifications.details": qualificationDetails || "" },
          $pull: { "qualifications.evidenceUrls": { level: qualificationLevel } }
        },
        { upsert: true }
      )

      // Step 2: Push new entry for this level
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        {
          $push: { "qualifications.evidenceUrls": { level: qualificationLevel, url: qualificationFileUrl } }
        },
        { upsert: true }
      )
    } else {
      // Fallback: just save details (no file or no level)
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { "qualifications.details": qualificationDetails || "" } },
        { upsert: true }
      )
    }

    res.json({
      message: "File saved",
      qualificationFileUrl,
      qualificationLevel
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteSection2File = async (req, res) => {
  try {
    const { studentId, fileUrl } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    await EnrollmentForm.findOneAndUpdate(
      { studentId },
      { $set: { "usi.staIdFileUrl": null } }
    )

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// ✅ FIXED: deleteSection3File — per-qualification evidence removal
const deleteSection3File = async (req, res) => {
  try {
    const { studentId, fileUrl, qualificationLevel } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    if (qualificationLevel) {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $pull: { "qualifications.evidenceUrls": { level: qualificationLevel } } }
      )
    } else {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { "qualifications.evidenceUrl": null } }
      )
    }

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteSection5File = async (req, res) => {
  try {
    const { studentId, fileUrl, fileType } = req.body
    if (!studentId || !fileUrl) return res.status(400).json({ message: "Required" })

    const parts = fileUrl.split("/")
    const filename = parts[parts.length - 1].split(".")[0]
    const publicId = `enrollment-docs/${filename}`

    await cloudinary.uploader.destroy(publicId)

    const fieldMap = {
      idDocument: "idDocumentUrl",
      photoDocument: "photoDocumentUrl",
      signature: "signatureUrl"
    }

    const field = fieldMap[fileType]
    if (field) {
      await EnrollmentForm.findOneAndUpdate(
        { studentId },
        { $set: { [field]: null } }
      )
    }

    res.json({ message: "File deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const getEnrollmentFormById = async (req, res) => {
  console.log("getEnrollmentFormById called with id:", req.params.id)
  try {
    const form = await EnrollmentForm.findById(req.params.id)
    if (!form) return res.status(404).json({ message: "Not found" })
    res.json(form)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createEnrollmentForm,
  getEnrollmentForms,
  updateEnrollmentStatus,
  saveSection,
  saveSection2File,
  saveSection3File,
  deleteSection2File,
  deleteSection3File,
  deleteSection5File,
  getEnrollmentFormById
}