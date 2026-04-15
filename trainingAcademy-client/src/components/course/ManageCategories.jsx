import { useState, useRef } from "react";
import "./ManageCategories.css";

const initialCategories = [
  { id: 1, name: "Short Courses", courseCount: 16, active: true },
  { id: 2, name: "Earthmoving Courses", courseCount: 4, active: true },
  { id: 3, name: "Working in Confined Space Courses", courseCount: 3, active: true },
  { id: 4, name: "Demolition Courses", courseCount: 1, active: true },
  { id: 5, name: "First Aid Courses", courseCount: 3, active: true },
  { id: 6, name: "Certificate Courses", courseCount: 3, active: true },
  { id: 7, name: "Height Safety Courses", courseCount: 2, active: true },
  { id: 8, name: "Traffic Management Courses", courseCount: 5, active: true },
  { id: 9, name: "Rigging Courses", courseCount: 4, active: true },
  { id: 10, name: "Forklift Courses", courseCount: 2, active: true },
];

export default function ManageCategories({ isOpen, onClose }) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addError, setAddError] = useState("");

  // Drag-to-reorder state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  if (!isOpen) return null;

  // ─── ADD ───────────────────────────────────────────────
  const handleAdd = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddError("Please enter a category name.");
      return;
    }
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setAddError("Category name already exists.");
      return;
    }
    const newId = Date.now();
    setCategories([
      ...categories,
      { id: newId, name: trimmed, courseCount: 0, active: true },
    ]);
    setNewCategoryName("");
    setAddError("");
  };

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  // ─── EDIT ──────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEdit = (id) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
    );
    setEditingId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // ─── DELETE ────────────────────────────────────────────
  const requestDelete = (cat) => setDeleteTarget(cat);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.courseCount > 0) {
      // Has courses → deactivate instead
      setCategories(
        categories.map((c) =>
          c.id === deleteTarget.id ? { ...c, active: false } : c
        )
      );
    } else {
      setCategories(categories.filter((c) => c.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const cancelDelete = () => setDeleteTarget(null);

  // ─── DRAG TO REORDER ───────────────────────────────────
  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    const updated = [...categories];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(index, 0, dragged);
    dragItem.current = index;
    setCategories(updated);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const activeCount = categories.filter((c) => c.active).length;

  return (
    <>
      {/* ── BACKDROP ── */}
      <div className="mcc-backdrop" onClick={onClose} />

      {/* ── MODAL ── */}
      <div className="mcc-modal" role="dialog" aria-modal="true" aria-labelledby="mcc-title">

        {/* Header */}
        <div className="mcc-header">
          <div>
            <h2 id="mcc-title" className="mcc-title">Manage Course Categories</h2>
            <p className="mcc-subtitle">Add, edit, or remove course categories</p>
          </div>
          <button className="mcc-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Add new category */}
        <div className="mcc-add-row">
          <div className="mcc-input-wrap">
            <input
              type="text"
              className={`mcc-input ${addError ? "mcc-input--error" : ""}`}
              placeholder="Enter new category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (addError) setAddError("");
              }}
              onKeyDown={handleAddKeyDown}
            />
            {addError && <span className="mcc-error-msg">{addError}</span>}
          </div>
          <button className="mcc-add-btn" onClick={handleAdd}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add
          </button>
        </div>

        {/* Category list */}
        <div className="mcc-list">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`mcc-item ${!cat.active ? "mcc-item--inactive" : ""} ${editingId === cat.id ? "mcc-item--editing" : ""}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Drag handle */}
              <span className="mcc-drag-handle" title="Drag to reorder">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                  <circle cx="4" cy="3" r="1.5" fill="currentColor"/>
                  <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="4" cy="13" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                </svg>
              </span>

              {/* Name / inline edit */}
              {editingId === cat.id ? (
                <div className="mcc-edit-row">
                  <input
                    className="mcc-edit-input"
                    value={editingName}
                    autoFocus
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <button className="mcc-save-btn" onClick={() => saveEdit(cat.id)}>Save</button>
                  <button className="mcc-cancel-btn" onClick={cancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="mcc-item-info">
                  <span className="mcc-item-name">{cat.name}</span>
                  <span className="mcc-item-count">{cat.courseCount} courses</span>
                  {!cat.active && <span className="mcc-inactive-badge">Deactivated</span>}
                </div>
              )}

              {/* Actions */}
              {editingId !== cat.id && (
                <div className="mcc-item-actions">
                  <button
                    className="mcc-action-btn mcc-action-btn--edit"
                    onClick={() => startEdit(cat)}
                    title="Edit category"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="mcc-action-btn mcc-action-btn--delete"
                    onClick={() => requestDelete(cat)}
                    title="Delete category"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mcc-footer">
          <span>Total Categories: <strong>{activeCount}</strong></span>
          <span className="mcc-footer-hint">• Drag to reorder (order appears on front page)</span>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      {deleteTarget && (
        <>
          <div className="mcc-dialog-backdrop" />
          <div className="mcc-dialog" role="alertdialog" aria-labelledby="mcc-dialog-title">
            <h3 id="mcc-dialog-title" className="mcc-dialog-title">Delete Category</h3>
            <p className="mcc-dialog-body">
              {deleteTarget.courseCount > 0
                ? `Are you sure you want to delete this category? This category has courses and will be deactivated instead.`
                : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
            </p>
            <div className="mcc-dialog-actions">
              <button className="mcc-dialog-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="mcc-dialog-confirm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}