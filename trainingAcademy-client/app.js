const API_URL = "https://api.octosofttechnologies.in"

async function loadForm() {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    if (!id) return

    try {
        const res = await fetch(`https://api.octosofttechnologies.in/api/enrollment-form/${id}`)
        const data = await res.json()
        fillForm(data)
    } catch (err) {
        console.error("Failed to load form:", err)
    }
}

function fillForm(data) {
    const p = data.personalDetails || {}
    const addr = data.address?.residential || {}
    const postal = data.address?.postal || {}
    const emg = data.emergencyContact || {}
    const usi = data.usiDetails || {}
    const edu = data.educationDetails || {}

    // TEXT FIELDS
    const fields = {
        surname: p.surname,
        givenName: p.givenName,
        middleName: p.middleName,
        preferredName: p.preferredName,
        dobDMY: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString("en-AU") : "",
        email: p.email,
        homePhone: p.homePhone,
        workPhone: p.workPhone,
        mobilePhone: p.mobilePhone,
        resAddress: addr.address,
        resSuburb: addr.suburb,
        resState: addr.state,
        resPostcode: addr.postcode,
        postalAddress: postal.address,
        postalSuburb: postal.suburb,
        postalState: postal.state,
        postalPostcode: postal.postcode,
        emgName: emg.name,
        emgRelation: emg.relationship,
        emgContact: emg.contactNumber,
        p3EmployerName: edu.employer,
        p3EmployerEmail: edu.employerEmail,
        p3EmployerPhone: edu.employerPhone,
        p13StudentName: data.declaration?.declarationName,
    }

    // Fill data-field spans
    Object.entries(fields).forEach(([key, value]) => {
        document.querySelectorAll(`[data-field="${key}"]`).forEach(el => {
            el.textContent = value || ""
        })
    })

    // Fill data-line spans
    const lines = {
        usiApplyName: p.givenName + " " + p.surname,
        townCityBirth: usi.townOfBirth,
        p13StudentName: data.declaration?.declarationName,
        p13StudentDate: data.declaration?.declarationDate
            ? new Date(data.declaration.declarationDate).toLocaleDateString("en-AU")
            : "",
    }

    Object.entries(lines).forEach(([key, value]) => {
        document.querySelectorAll(`[data-line="${key}"] .fillVal`).forEach(el => {
            el.textContent = value || ""
        })
    })

    // CHECKBOXES
    const checks = {
        title: p.title,
        gender: p.gender,
        emgConsent: emg.consent ? "Yes" : "No",
        usiPermission: usi.accessPermission ? "true" : "",
        priorEdu: edu.schoolLevel,
        empStatus: edu.employmentStatus,
        countryBirth: data.additionalInfo?.countryOfBirth === "Australia" ? "Australia" : "Other",
    }

    Object.entries(checks).forEach(([checkName, value]) => {
        document.querySelectorAll(`[data-check="${checkName}"]`).forEach(el => {
            el.textContent = el.dataset.value === value ? "✓" : ""
            el.style.fontWeight = "bold"
        })
    })

    // USI BOXES
    const usiNum = usi.usiNumber || ""
    const usiBoxes = document.querySelectorAll("#usiBoxes span:not(:first-child)")
    usiBoxes.forEach((box, i) => {
        box.textContent = usiNum[i] || ""
    })

    // SIGNATURE
    if (data.declaration?.signature) {
        const sigLine = document.querySelector(`[data-line="p13StudentSignature"] .fillVal`)
        if (sigLine) {
            const img = document.createElement("img")
            img.src = data.declaration.signature
            img.style.height = "40px"
            sigLine.appendChild(img)
        }
    }
}

document.addEventListener("DOMContentLoaded", loadForm)