const EnrollmentForm = require("../models/EnrollmentForm");
const EnrollmentFlow = require("../models/EnrollmentFlows");

const createEnrollmentForm = async (req, res) => {
  try {
    const data = req.body;
    const idDocumentUrl = req.files?.idDocument?.[0]?.path || null;
    const photoDocumentUrl = req.files?.photoDocument?.[0]?.path || null;
    const signatureUrl = req.files?.signature?.[0]?.path || null;

    const updateData = {
      studentId: data.userId,

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

      qualifications: {
        hasQualification: data.hasQualifications === "yes",
        types: data.qualificationLevels
      },

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
        otherLanguage: data.otherLanguage
      },

      specialNeeds: {
        hasDisability: data.hasDisability === "yes",
        types: data.disabilityTypes,
        other: data.disabilityNotes
      },

      // ✅ null வந்தா overwrite பண்ணாம இருக்கும்
      ...(idDocumentUrl && { idDocumentUrl }),
      ...(photoDocumentUrl && { photoDocumentUrl }),
      ...(signatureUrl && { signatureUrl }),

      enrollmentFormCompleted: true,
      enrollmentFormSubmittedAt: new Date()
    }

    // ✅ upsert — duplicate இல்லாம
    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId: data.userId },
      updateData,
      { new: true, upsert: true }
    )

    await EnrollmentFlow.findOneAndUpdate(
      { studentId: data.userId, status: "active" },
      { enrollmentFormId: form._id, currentStep: 4 }
    )

    res.status(201).json({ message: "Enrollment form submitted successfully" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

const getEnrollmentForms = async (req, res) => {
  try {
    const { studentId } = req.query; // ✅ query param எடுக்கிறோம்

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
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
const saveSection = async (req, res) => {
  try {
    const { studentId, section, ...sectionData } = req.body

    if (!studentId) return res.status(400).json({ message: "studentId required" })

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
    "usi.number": sectionData.usi,
    "usi.permission": sectionData.usiPermission,
    "usi.staApplication": sectionData.staApplication,  // ✅ nested
    "usi.staAuthoriseName": sectionData.staAuthoriseName,
    "usi.staConsent": sectionData.staConsent,
    "usi.staTownOfBirth": sectionData.staTownOfBirth,
    "usi.staOverseasTown": sectionData.staOverseasTown,
    "usi.staIdType": sectionData.staIdType,
  }
}

    if (section === "3" || section === 3) {
      updateFields = {
        education: sectionData.education,
        qualifications: sectionData.qualifications,
        employment: sectionData.employment,
        trainingReason: sectionData.trainingReason,
      }
    }

    if (section === "4" || section === 4) {
      updateFields = {
           "language.countryOfBirth": sectionData.language?.countryOfBirth,
    "language.otherLanguage": sectionData.language?.otherLanguage,
    "language.speaksOtherLanguage": sectionData.language?.speaksOtherLanguage, // ✅
    "language.indigenousStatus": sectionData.language?.indigenousStatus,        // ✅
    specialNeeds: sectionData.specialNeeds,
      }
    }

    const form = await EnrollmentForm.findOneAndUpdate(
      { studentId },
      { $set: updateFields },
      { new: true, upsert: true }
    )

    res.json({ message: `Section ${section} saved`, form })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { createEnrollmentForm, getEnrollmentForms, updateEnrollmentStatus, saveSection }



