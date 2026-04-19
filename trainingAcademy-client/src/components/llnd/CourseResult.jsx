import { useLocation } from "react-router-dom"
import "../../styles/CourseResult.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { API_URL } from "../../data/service"






function CourseResult({ onRetry, onContinue, data }) {

    const navigate = useNavigate()
    const [agree1, setAgree1] = useState(false)
    const [agree2, setAgree2] = useState(false)
    return (
        <div className="result-overlay">

            <div className="result-card">

                <h2 className="result-title"> Assessment Complete</h2>

                <div className="result-box">

                    <h4>Your Results:</h4>

                    <p>Total Questions: <span>{data.total}</span></p>
                    <p>Correct Answers: {data.correct}</p>
                    <p>Overall Percentage: <span>{data.percentage}%</span></p>

                    <div className="section-list">
                        {data.sections.map((s, i) => (
                            <div key={i} className="section-row">
                                <span>Section {i + 1}: {s.name}</span>

                                <span className={`badge ${s.status === "Passed" ? "pass" : "fail"}`}>
                                    {s.score}% - {s.status}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* DECLARATION */}
                <div className="declaration">
                    <h4>Declaration</h4>

                    <p>Before proceeding, please confirm the following:</p>

                    <label>
                        <input type="checkbox"
                            checked={agree1}
                            onChange={(e) => setAgree1(e.target.checked)}
                        />
                        I completed this quiz honestly and did not cheat in any way.
                    </label>

                    <label>
                        <input type="checkbox"
                            checked={agree2}
                            onChange={(e) => setAgree2(e.target.checked)}
                        /> I understand that my score will be recorded under my name.
                    </label>

                    <p className="confirm-text">
                        Please confirm your name below and click <b>Continue</b> to proceed.
                    </p>

                    <div className="name-row">
                        <span><b>Name:</b> {data.name}</span>
                        <span><b>Date:</b> {data.date}</span>
                    </div>
                </div>

                <button
                    className="continue-btn"
                    disabled={!(agree1 && agree2)}
                    onClick={async () => {
                        try {


                            const flowId = localStorage.getItem("flowId");

                            const payload = {
                                flowId,
                                ...data,
                                answers: data.answers || []  
                            };

                            const res = await fetch(`${API_URL}/api/flow/llnd`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(payload)
                            });

                            // 🔥 next step
                            onContinue();

                        } catch (err) {
                            console.error(err);
                            alert("Failed to save assessment");
                        }
                    }}
                >
                    Continue to Enrollment Form
                </button>


            </div>

        </div>
    )
}

export default CourseResult