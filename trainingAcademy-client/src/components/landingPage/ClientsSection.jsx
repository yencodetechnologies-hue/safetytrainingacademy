import "../../styles/ClientsSection.css"

function ClientsSection() {
    return (
        <section className="clients-section">
            <div className="clients-container">
                <h5 className="clients-title">OUR TRUSTED PARTNERS</h5>
            </div>

            <div className="mlp-brands-track-wrap">
                <div className="mlp-brands-track">
                    {[...Array(2)].map((_, dupIdx) => (
                        <div key={dupIdx} className="mlp-brands-row">
                            {[
                                { bg: "#A100FF", color: "#fff",    text: "Accenture"   },
                                { bg: "#86BC25", color: "#fff",    text: "Deloitte."   },
                                { bg: "#FFE600", color: "#2E2E38", text: "EY"          },
                                { bg: "#4285F4", color: "#fff",    text: "Google Cloud"},
                                { bg: "#222",    color: "#fff",    text: "Klaviyo"     },
                                { bg: "#F80000", color: "#fff",    text: "ORACLE"      },
                                { bg: "#0052CC", color: "#fff",    text: "Atlassian"   },
                                { bg: "#FF9900", color: "#fff",    text: "AWS"         },
                            ].map((brand, i) => (
                                <div key={i} className="mlp-brand-logo" style={{ background: brand.bg }}>
                                    <span style={{ color: brand.color, fontWeight: 700, fontSize: 12, letterSpacing: "0.02em" }}>
                                        {brand.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}

export default ClientsSection