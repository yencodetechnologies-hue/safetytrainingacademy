import { useState } from "react";
import "../../styles/Gallery.css";

const initialImages = [
  {
    id: 1,
    title: "testing image",
    category: "COURSE",
    courseName: "Work Safely at Heights",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    active: true,
  },
  {
    id: 2,
    title: "Saftery training academy",
    category: "COURSE",
    courseName: "Work Safely at Heights",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    active: true,
  },
];

export default function Gallery() {
  const [images, setImages] = useState(initialImages);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "" });

  const filtered = images.filter((img) =>
    img.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setSearch("");
  };

  const handleAddClick = () => {
    setEditItem(null);
    setFormData({ title: "", imageUrl: "" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({ title: item.title, imageUrl: item.imageUrl });
    setShowModal(true);
  };

  const handleDeactivate = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, active: !img.active } : img
      )
    );
  };

  const handleDelete = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleModalSave = () => {
    if (!formData.title.trim()) return;
    if (editItem) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === editItem.id ? { ...img, ...formData } : img
        )
      );
    } else {
      setImages((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: formData.title,
          category: "COURSE",
          courseName: "Work Safely at Heights",
          imageUrl:
            formData.imageUrl ||
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
          active: true,
        },
      ]);
    }
    setShowModal(false);
  };

  return (
    <div className="gallery-page">
      {/* Page Header */}
      <div className="gallery-page-header">
        <h1 className="gallery-page-title">Gallery</h1>
        <p className="gallery-page-subtitle">
          Manage images displayed on the Gallery page
        </p>
      </div>

      {/* Stats Card */}
      <div className="gallery-stats-card">
        <p className="stats-label">Total Images</p>
        <p className="stats-value">{images.length}</p>
      </div>

      {/* Gallery Panel */}
      <div className="gallery-panel">
        {/* Panel Header */}
        <div className="gallery-panel-header">
          <div className="gallery-panel-title-group">
            <h2 className="gallery-panel-title">Gallery Images</h2>
            <p className="gallery-panel-subtitle">
              Add images with titles to display on the public Gallery page
            </p>
          </div>
          <div className="gallery-panel-actions">
            <button className="btn-refresh" onClick={handleRefresh}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
            <button className="btn-add" onClick={handleAddClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Gallery
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="gallery-search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="gallery-search"
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {filtered.length === 0 && (
            <p className="gallery-empty">No images found.</p>
          )}
          {filtered.map((img) => (
            <div className={`gallery-card ${!img.active ? "inactive" : ""}`} key={img.id}>
              <div className="gallery-card-image-wrap">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="gallery-card-image"
                />
                <div className="gallery-card-overlay">
                  <span className="overlay-category">{img.category}</span>
                  <span className="overlay-course">{img.courseName}</span>
                </div>
                {!img.active && (
                  <div className="gallery-card-inactive-badge">Inactive</div>
                )}
              </div>
              <div className="gallery-card-footer">
                <p className="gallery-card-title">{img.title}</p>
                <div className="gallery-card-btns">
                  <button className="card-btn edit" onClick={() => handleEdit(img)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button className="card-btn deactivate" onClick={() => handleDeactivate(img.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    {img.active ? "Deactivate" : "Activate"}
                  </button>
                  <button className="card-btn delete" onClick={() => handleDelete(img.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? "Edit Image" : "Add Gallery Image"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Title</label>
              <input
                className="modal-input"
                type="text"
                placeholder="Enter title..."
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              />
              <label className="modal-label">Image URL</label>
              <input
                className="modal-input"
                type="text"
                placeholder="Enter image URL..."
                value={formData.imageUrl}
                onChange={(e) => setFormData((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-btn save" onClick={handleModalSave}>
                {editItem ? "Save Changes" : "Add Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}