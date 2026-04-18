import { useState, useEffect } from "react";
import "../styles/Companies.css";
import axios from "axios";
import CompanyViewModal from "./CompanyViewModal"; // ← import the new modal

const PAGE_SIZE = 10;

/* ── Icons ── */
const EyeIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOffIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const EditIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const SearchIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const BuildingIcon = () => (
    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const CloseIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const MailIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const PhoneIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const LockIcon = () => (
    <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

/* ── Add / Edit Company Modal ── */
function AddCompanyModal({ onClose, onAdd, editData, onUpdate }) {
    const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Company name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!editData) {
            if (!form.password) e.password = "Password is required";
            else if (form.password.length < 6) e.password = "Minimum 6 characters";
        }
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (editData) {
                const res = await axios.put(
                    `https://api.octosofttechnologies.in
/api/companies/${editData._id}`,
                    { companyName: form.name, email: form.email, mobileNumber: form.mobile },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onUpdate(res.data.data);
            } else {
                const res = await axios.post(
                    "https://api.octosofttechnologies.in
/api/companies",
                    { companyName: form.name, email: form.email, mobileNumber: form.mobile, password: form.password },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onAdd(res.data.data);
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert(editData ? "Update failed" : "Create failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    useEffect(() => {
        if (editData) {
            setForm({
                name: editData.companyName || "",
                email: editData.email || "",
                mobile: editData.mobileNumber || "",
                password: "",
            });
        }
    }, [editData]);

    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal-box">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{editData ? "Edit Company" : "Add Company"}</h2>
                        <p className="modal-subtitle">Fill in company name, email, and password to create a company account</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Company Name</label>
                        <div className={`field-input-wrap ${errors.name ? "field-error" : ""}`}>
                            <span className="field-icon"><BuildingIcon /></span>
                            <input className="field-input" placeholder="Acme Corp" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                        </div>
                        {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>
                    <div className="field-group">
                        <label className="field-label">Email</label>
                        <div className={`field-input-wrap ${errors.email ? "field-error" : ""}`}>
                            <span className="field-icon"><MailIcon /></span>
                            <input className="field-input" type="email" placeholder="company@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                        </div>
                        {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>
                    <div className="field-group">
                        <label className="field-label">Mobile Number</label>
                        <div className="field-input-wrap">
                            <span className="field-icon"><PhoneIcon /></span>
                            <input className="field-input" placeholder="0400 000 000" value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} />
                        </div>
                    </div>
                    {!editData && (
                        <div className="field-group">
                            <label className="field-label">Password</label>
                            <div className={`field-input-wrap ${errors.password ? "field-error" : ""}`}>
                                <span className="field-icon"><LockIcon /></span>
                                <input
                                    className="field-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                />
                                <button className="pwd-toggle" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.password && <span className="error-msg">{errors.password}</span>}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-add-modal" onClick={handleSubmit}>
                        {loading ? "Processing..." : editData ? "Update Company" : "Add Company"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Component ── */
export default function Companies() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editCompany, setEditCompany] = useState(null);

    // ← NEW: separate state for the view modal
    const [viewCompany, setViewCompany] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("https://api.octosofttechnologies.in
/api/companies", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCompanies(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCompanies();
    }, []);

    const filtered = companies.filter((c) => {
        const name  = c.companyName || c.name || "";
        const email = c.email || "";
        const matchSearch =
            search === "" ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `https://api.octosofttechnologies.in
/api/companies/${id}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompanies((prev) =>
                prev.map((c) => c._id === id ? { ...c, status: res.data.data.status } : c)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://api.octosofttechnologies.in
/api/companies/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanies((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const handleAddCompany = (company) => {
        setCompanies((prev) => [company, ...prev]);
    };

    return (
        <div className="companies-wrapper">

            {/* ── Add / Edit Modal ── */}
            {showModal && (
                <AddCompanyModal
                    onClose={() => { setShowModal(false); setEditCompany(null); }}
                    onAdd={handleAddCompany}
                    editData={editCompany}
                    onUpdate={(updated) => {
                        setCompanies(prev => prev.map(c => c._id === updated._id ? updated : c));
                    }}
                />
            )}

            {/* ── View Modal ── */}
            {viewCompany && (
                <CompanyViewModal
                    company={viewCompany}
                    onClose={() => setViewCompany(null)}
                />
            )}

            {/* Header */}
            <div className="companies-header">
                <div>
                    <h1 className="companies-title">Companies</h1>
                    <p className="companies-subtitle">Manage company accounts</p>
                </div>
                <button className="btn-add-company" onClick={() => { setEditCompany(null); setShowModal(true); }}>
                    <PlusIcon /> Add Company
                </button>
            </div>

            {/* Search & Filter */}
            <div className="search-card">
                <h3 className="search-card-title">Search & Filter</h3>
                <p className="search-card-subtitle">Find companies by name or email</p>
                <div className="search-row">
                    <div className="search-input-wrap">
                        <span className="search-input-icon"><SearchIcon /></span>
                        <input
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                            placeholder="Search companies..."
                        />
                    </div>
                    <select
                        className="status-select"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <button className="btn-search" onClick={() => setPage(1)}>
                        <SearchIcon /> Search
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <div className="table-card-header">
                    <h3 className="table-card-title">Company Accounts ({filtered.length})</h3>
                    <p className="table-card-subtitle">Manage company registrations</p>
                </div>

                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Company mobile number</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((company) => (
                                <tr key={company._id}>
                                    <td>
                                        <div className="cell-date-main">
                                            {new Date(company.createdAt).toLocaleDateString("en-GB")}
                                        </div>
                                        <div className="cell-date-time">
                                            {new Date(company.createdAt).toLocaleTimeString("en-IN", {
                                                hour: "2-digit", minute: "2-digit", hour12: true,
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-cell">
                                            <div className="company-icon"><BuildingIcon /></div>
                                            <span className="company-name">{company.companyName}</span>
                                        </div>
                                    </td>
                                    <td>{company.email}</td>
                                    <td>{company.mobileNumber ? company.mobileNumber : <span className="dash">—</span>}</td>
                                    <td>
                                        <span className={`badge ${company.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td><span className="last-login">{company.lastLogin || "Never"}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            {/* ← Eye icon now opens CompanyViewModal */}
                                            <button
                                                className="btn-icon btn-icon-view"
                                                title="View"
                                                onClick={() => setViewCompany(company)}
                                            >
                                                <EyeIcon />
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-edit"
                                                title="Edit"
                                                onClick={() => { setEditCompany(company); setShowModal(true); }}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                className="btn-deactivate"
                                                onClick={() => handleToggle(company._id)}
                                            >
                                                {company.status === "Active" ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-delete"
                                                title="Delete"
                                                onClick={() => handleDelete(company._id)}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination-row">
                    <span className="pagination-info">
                        Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} to{" "}
                        {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
                    </span>
                    <div className="pagination-controls">
                        <button className="btn-page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Previous
                        </button>
                        <span className="page-label">Page {page} of {totalPages}</span>
                        <button className="btn-page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}