import { useState, useEffect } from "react"
import "../styles/Profile.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// ── Field component — outside StudentProfile to prevent focus loss ──────────
// Inside-ல் வச்சா ஒவ்வொரு keystroke-லயும் remount ஆகி focus போகும்
function Field({ label, value, fieldKey, type = "text", editing, form, onSet }) {
  return (
    <div className="sp-field">
      <label className="sp-label">{label}</label>
      {editing ? (
        type === "textarea" ? (
          <textarea
            className="sp-input sp-textarea"
            value={form[fieldKey] || ""}
            onChange={e => onSet(fieldKey, e.target.value)}
          />
        ) : (
          <input
            className="sp-input"
            type={type}
            value={form[fieldKey] || ""}
            onChange={e => onSet(fieldKey, e.target.value)}
          />
        )
      ) : (
        <div className="sp-value">{value || "—"}</div>
      )}
    </div>
  )
}


export default function Profile() {
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({})
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState("")

  // உங்கள் existing localStorage key
  const studentId = localStorage.getItem("enrollId") || localStorage.getItem("studentId")

  useEffect(() => {
    if (!studentId) {
      setError("Student ID not found. Please login again.")
      setLoading(false)
      return
    }

    fetch(`${API}/student/profile/${studentId}`)
      .then(r => r.json())
      .then(data => {
        if (data.message) throw new Error(data.message)
        setProfile(data)
        setForm(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [studentId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res  = await fetch(`${API}/enroll/enrollment/${studentId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Save failed")
      setProfile(data)
      setForm(data)
      setEditing(false)
      setSuccess("Profile updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
    setError("")
  }



  if (loading) return <div className="sp-loading">Loading profile…</div>
  if (!profile && error) return <div className="sp-error-msg">{error}</div>

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-AU", {
        day: "numeric", month: "short", year: "numeric"
      })
    : "—"

  return (
    <div className="sp-page">

      <div className="sp-page-header">
        <div>
          <h1 className="sp-page-title">My Profile</h1>
          <p className="sp-page-sub">Manage your personal information and account settings</p>
        </div>
        <div className="sp-header-actions">
          {editing ? (
            <>
              <button className="sp-btn-save" onClick={handleSave} disabled={saving}>
                <i className="fa-regular fa-floppy-disk" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button className="sp-btn-cancel" onClick={handleCancel}>
                <i className="fa-solid fa-xmark" /> Cancel
              </button>
            </>
          ) : (
            <button className="sp-btn-edit" onClick={() => setEditing(true)}>
              <i className="fa-solid fa-pencil" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {success && <div className="sp-toast sp-toast-success">✓ {success}</div>}
      {error   && <div className="sp-toast sp-toast-error">⚠ {error}</div>}

      <div className="sp-layout">

        {/* Left Card */}
        <div className="sp-card-wrap">
          <div className="sp-profile-card">
            <div className="sp-avatar-wrap">
              <div className="sp-avatar">
                <i className="fa-solid fa-user" />
              </div>
            </div>
            <h2 className="sp-card-name">{profile?.name || "Student"}</h2>
            <p className="sp-card-id">{profile?.studentId || "—"}</p>
            <div className="sp-card-info">
              <div className="sp-card-row">
                <i className="fa-regular fa-envelope" />
                <span>{profile?.email || "—"}</span>
              </div>
              <div className="sp-card-row">
                <i className="fa-solid fa-phone" />
                <span>{profile?.phone || "—"}</span>
              </div>
              <div className="sp-card-row">
                <i className="fa-regular fa-calendar" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sections */}
        <div className="sp-sections">

          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Personal Information</h3>
              <p>Your basic personal details</p>
            </div>
            <div className="sp-grid-2">
              <Field label="Full Name"     value={profile?.name}  fieldKey="name"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="Email Address" value={profile?.email} fieldKey="email" type="email"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="Phone Number"  value={profile?.phone} fieldKey="phone" type="tel"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="Date of Birth" value={profile?.dob}   fieldKey="dob"   type="date"
                  editing={editing} form={form} onSet={set}
                />
            </div>
            <div className="sp-grid-1">
              <Field label="Bio" value={profile?.bio} fieldKey="bio" type="textarea"
                  editing={editing} form={form} onSet={set}
                />
            </div>
          </div>

          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Address Information</h3>
              <p>Your residential address</p>
            </div>
            <div className="sp-grid-1">
              <Field label="Street Address" value={profile?.address?.street} fieldKey="street"
                  editing={editing} form={form} onSet={set}
                />
            </div>
            <div className="sp-grid-3">
              <Field label="City"     value={profile?.address?.city}  fieldKey="city"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="State"    value={profile?.address?.state} fieldKey="state"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="ZIP Code" value={profile?.address?.zip}   fieldKey="zip"
                  editing={editing} form={form} onSet={set}
                />
            </div>
          </div>

          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Emergency Contact</h3>
              <p>Person to contact in case of emergency</p>
            </div>
            <div className="sp-grid-2">
              <Field label="Contact Name"  value={profile?.emergencyContact?.name}  fieldKey="emergencyName"
                  editing={editing} form={form} onSet={set}
                />
              <Field label="Contact Phone" value={profile?.emergencyContact?.phone} fieldKey="emergencyPhone" type="tel"
                  editing={editing} form={form} onSet={set}
                />
            </div>
          </div>

          <div className="sp-section">
            <div className="sp-section-header">
              <h3>Enrollment Statistics</h3>
              <p>Your learning journey at a glance</p>
            </div>
            <div className="sp-stats-grid">
              <div className="sp-stat-card sp-stat-purple">
                <span className="sp-stat-label">Total Courses</span>
                <span className="sp-stat-value">{profile?.stats?.total ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-blue">
                <span className="sp-stat-label">Active</span>
                <span className="sp-stat-value">{profile?.stats?.active ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-green">
                <span className="sp-stat-label">Completed</span>
                <span className="sp-stat-value">{profile?.stats?.completed ?? 0}</span>
              </div>
              <div className="sp-stat-card sp-stat-orange">
                <span className="sp-stat-label">Certificates</span>
                <span className="sp-stat-value">{profile?.stats?.certificates ?? 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}