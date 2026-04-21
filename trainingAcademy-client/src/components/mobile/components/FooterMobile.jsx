import React from "react";
import "../styles/FooterMobile.css";
import logo from "../../../assets/Logo STA.jpeg"

function FooterMobile() {
  return (
    <footer className="footer">
      <div className="footer-top-bar"></div>

      {/* <div className="footer-brand">
        <div className="footer-brand-left">
          <div className="footer-logo">SAFETY TRAINING ACADEMY</div>
        </div>
      </div> */}

      <p className="footer-tagline">
        Professional certification programs engineered for career advancement.
      </p>

      <div className="footer-socials">
        <div className="footer-logo-img">
          <img src={logo} alt="Logo" />
        </div>
        <div className="footer-social-icons">
          <span className="social-btn">
            <i className="fa-brands fa-facebook-f"></i>
          </span>
          <span className="social-btn">
            <i className="fa-brands fa-linkedin-in"></i>
          </span>
          <span className="social-btn">
            <i className="fa-brands fa-instagram"></i>
          </span>
        </div>
      </div>
<div className="footer-logo">SAFETY TRAINING ACADEMY</div>
      <div className="footer-divider"></div>

      <div className="footer-middle">
        <div className="footer-col footer-location">
          <div className="sec-label">Head Office</div>
          <div className="row-info">
            <i className="fa-solid fa-location-dot info-icon"></i>
            <p>
              Safety Training Academy Sydney<br />
              3/14-16 Marjorie Street,<br />
              Sefton NSW 2162
            </p>
          </div>
        </div>

        <div className="footer-col footer-contact">
          <div className="sec-label">Contact</div>
          <div className="row-info">
            <i className="fa-solid fa-envelope info-icon"></i>
            <p>info@safetytrainingacademy.edu.au</p>
          </div>
          <div className="row-info">
            <i className="fa-solid fa-phone info-icon"></i>
            <p>0483 878 887</p>
          </div>
          <div className="row-info">
            <i className="fa-solid fa-phone info-icon"></i>
            <p>1300 976 097</p>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-nav">
        <div className="sec-label">Navigation</div>
        <ul className="footer-links">
          <li>Home</li>
          <li>Book Now</li>
          <li>Courses</li>
          <li>About Us</li>
          <li>Blog</li>
          <li>Contact</li>
        </ul>
      </div>

      <div className="footer-bottom">
        <span>© 2024 Safety Training Academy</span>
        <span className="footer-rights">ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
}

export default FooterMobile;