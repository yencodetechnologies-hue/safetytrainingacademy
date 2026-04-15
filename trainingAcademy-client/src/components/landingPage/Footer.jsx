import "../../styles/Footer.css"

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-col footer-brand">

          <div className="footer-logo">
            SAFETY TRAINING
            <span>ACADEMY</span>
          </div>

          <p>
            Professional certification programs for your career growth.
          </p>

          <div className="footer-socials">
            <span><i className="fa-brands fa-facebook-f"></i></span>
            <span><i className="fa-brands fa-linkedin-in"></i></span>
            <span><i className="fa-brands fa-instagram"></i></span>
          </div>

        </div>

        {/* HEAD OFFICE */}
        <div className="footer-col footer-location">

          <h3 className="head-office-">Head Office</h3>
            <i className="fa-solid fa-location-dot location-icon-foo"></i>
          <p>
             Safety Training Academy  Sydney <br />
            3/14-16 Marjorie Street, Sefton NSW 2162
          </p>

        </div>

        {/* CONTACT */}
        <div className="footer-col footer-contact">

          <h3>Contact</h3>
          <div className="contact-icons">
            <i className="fa-solid fa-envelope contact-icon"></i>
             <i className="fa-solid fa-phone contact-icon"></i>
             <i className="fa-solid fa-phone contact-icon"></i>
             <i className="fa-solid fa-car-side"></i>
          </div>

          <p>info@safetytrainingacademy.edu.au</p>
          <p> 0483 878 887</p>
          <p> 1300 976 097</p>
          <p>RTO: 45234</p>

        </div>

        {/* LINKS */}
        <div className="footer-col">

          <h3>Link</h3>

          <ul className="footer-links">
            <li>Home</li>
            <li>Book Now</li>
            <li>Courses</li>
            <li>About Us</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>

        </div>

      </div>

      <div className="footer-bottom">
        © 2024 Safety Training Academy. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer