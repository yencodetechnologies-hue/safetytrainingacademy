import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from './landingPage/Navbar';
import Footer from './landingPage/Footer';
import '../styles/PublicForms.css';

const formsData = [
  {
    category: "Student Enrollment",
    items: [
      {
        title: "Online Enrollment Form",
        desc: "Complete your enrollment details online to secure your spot.",
        icon: "fa-solid fa-file-signature",
        type: "Online",
        link: "/book-now"
      },
      {
        title: "Student Handbook",
        desc: "Essential information about your rights, responsibilities, and training details.",
        icon: "fa-solid fa-book-open",
        type: "PDF",
        link: "#"
      }
    ]
  },
  {
    category: "Policies & Procedures",
    items: [
      {
        title: "Fees & Refund Policy",
        desc: "Detailed information about course fees, payment terms, and refund eligibility.",
        icon: "fa-solid fa-money-check-dollar",
        type: "PDF",
        link: "#"
      },
      {
        title: "Complaints & Appeals",
        desc: "Our formal process for handling student grievances and assessment appeals.",
        icon: "fa-solid fa-scale-balanced",
        type: "PDF",
        link: "#"
      }
    ]
  },
  {
    category: "Technical Support",
    items: [
      {
        title: "USI Creation Guide",
        desc: "Need a USI? Follow this step-by-step guide to create yours in minutes.",
        icon: "fa-solid fa-id-card",
        type: "Guide",
        link: "https://www.usi.gov.au/students/get-a-usi"
      },
      {
        title: "Code of Practice",
        desc: "Our commitment to providing high-quality, professional training services.",
        icon: "fa-solid fa-gavel",
        type: "PDF",
        link: "#"
      }
    ]
  }
];

export default function PublicForms({ courses }) {
  const navigate = useNavigate();

  return (
    <div className="pf-root">
      <PublicNavbar courses={courses} />
      
      <div className="pf-hero">
        <div className="pf-container">
          <h1>Resources & Forms</h1>
          <p>Access essential documents, student guides, and policy information to support your training journey.</p>
        </div>
      </div>

      <div className="pf-content">
        <div className="pf-container">
          {formsData.map((section, idx) => (
            <div key={idx} className="pf-section">
              <h2 className="pf-section-title">{section.category}</h2>
              <div className="pf-grid">
                {section.items.map((item, i) => (
                  <div key={i} className="pf-card">
                    <div className="pf-card-icon">
                      <i className={item.icon}></i>
                    </div>
                    <div className="pf-card-body">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                      <div className="pf-card-footer">
                        <span className={`pf-badge pf-badge-${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                        <button 
                          className="pf-action-btn"
                          onClick={() => {
                            if (item.link.startsWith('http')) {
                              window.open(item.link, '_blank');
                            } else if (item.link !== '#') {
                              navigate(item.link);
                            }
                          }}
                        >
                          {item.type === 'Online' ? 'Start Online' : 'View Document'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
