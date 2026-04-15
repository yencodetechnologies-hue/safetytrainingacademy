import "../../styles/AboutSection.css"
import ReviewsSection from "../ReviewsSection"
import woodcutImg from "../../assets/about-us-woodcut.jpeg"
import systemUser from "../../assets/about-us-sys.jpeg"
import fire from "../../assets/about-us-fire.jpeg"
import workers from "../../assets/workers.png"

function AboutSection() {

    return (

        <section className="about-section">

            <div className="container about-grid">

                <div className="about-content">

                    <div className="about-badge">24</div>

                    <h2>About Us</h2>

                    <p>
                        Safety Training Academy is a Registered Training Organization specializing in
                        Training and Assessing of High-Risk Licencing under the National Standard.
                    </p>

                    <p>
                        Our team consists of highly skilled industry experts with extensive field
                        experience and modern training facilities.
                    </p>

                    <div className="about-stats">

                        <div className="stat-box">
                            <div className="icon">📅</div>
                            <div className="about-sec-info">
                                <h3>2019</h3>
                                <p>Year Established</p>
                            </div>
                        </div>

                        <div className="stat-box">
                            <div className="icon">👥</div>
                            <div className="about-sec-info">
                                <h3>Over 50</h3>
                                <p>Years of combined experience</p>
                            </div>
                        </div>

                    </div>

                    <button className="about-btn">See More</button>

                </div>


                <div className="about-images">

                    <img className="system-using-aboutus" src={systemUser} />
                    <img className="workers-aboutus" src={workers} />
                    <img className="fire-aboutus" src={fire} />
                    <img className="woodcut-aboutus" src={woodcutImg} />

                </div>

            </div>
            <ReviewsSection />

        </section>

    )

}

export default AboutSection