import "../../styles/ClientsSection.css"
import clientOne from "../../assets/client-one.jpeg"
import clientTwo from "../../assets/client-two.jpeg"
import clientThree from "../../assets/client-three.jpeg"
import clientFour from "../../assets/client-four.jpeg"

function ClientsSection() {

    const clients = [
        clientOne,
        clientTwo,
        clientThree,
        clientFour
    ]

    return (

        <section className="clients-section">

            <div className="container clients-container">

                <h2 className="clients-title">Our Clients</h2>

                <div className="clients-grid">

                    {clients.map((logo, index) => (
                        <div key={index} className="client-card">

                            <img src={logo} alt="client" />

                        </div>
                    ))}

                </div>

            </div>

        </section>

    )

}

export default ClientsSection