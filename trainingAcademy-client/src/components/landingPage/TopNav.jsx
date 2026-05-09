import "../../styles/TopNav.css"

function TopNav() {

    return (

        <div className="top-nav">

            <div className="top-nav-container">

                <div className="top-item">
                    <i className="fa-solid fa-phone"></i> 
                    <span style={{ display: "flex", gap: "8px" }}>
                        <a href="tel:1300976097" style={{ color: "inherit", textDecoration: "none" }}>1300 976 097</a>
                        <span style={{ opacity: 0.5 }}>|</span>
                        <a href="tel:0483878887" style={{ color: "inherit", textDecoration: "none" }}>0483 878 887</a>
                    </span>
                </div>

                <div className="top-item">
                    <i className="fa-regular fa-envelope"></i>
                    <a href="mailto:info@safetytrainingacademy.edu.au" style={{ color: "inherit", textDecoration: "none" }}>info@safetytrainingacademy.edu.au</a>
                </div>

                <div className="top-item">
                    <i className="fa-solid fa-location-dot"></i> 3/14-16 Marjorie Street, Sefton NSW 2162
                </div>

            </div>

        </div>

    )

}

export default TopNav