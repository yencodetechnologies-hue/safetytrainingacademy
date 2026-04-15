import "../../styles/LLNDComplete.css"
import { FaCheckCircle } from "react-icons/fa"

function LLNDAssessmentComplete({ data, onRetry,attempt }) {

   const safeData = data || {
    total: 0,
    correct: 0,
    percentage: 0,
    sections: []
  }

const isOverallPass = safeData.percentage >= 67;

const isAllSectionsPass = safeData.sections.every(
  (s) => s.status === "Passed"
);

const isPassed = isOverallPass && isAllSectionsPass;

  return (
    <div className="llnd-complete-card">

      <div className="llnd-header">
        📋 Step 3: LLND Assessment - Complete
      </div>

      <div className={`llnd-body ${isPassed ? "pass-bg" : "fail-bg"}`}>

        <FaCheckCircle className="complete-icon" />

        <h3>
          {isPassed ? "Assessment Passed!" : "Assessment Completed"}
        </h3>

        <p className="sub-text">
          {isPassed
            ? "Congratulations! You have successfully passed the LLND assessment."
            : "You have completed the assessment. Please reattempt to continue."
          }
        </p>

        <p className="attempt">Attempt {attempt} of 4</p>

        <p className="score">
          Total: {data.correct}/{data.total} ({data.percentage}%)
        </p>

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

        {!isPassed && (
          <button className="retry-btn" onClick={onRetry}>
            Retry Again
          </button>
        )}

      </div>

      {isPassed && (
        <div className="continue-wrapper">
          <button className="continue-btn">
            Continue to Enrollment Form →
          </button>
        </div>
      )}

    </div>
  )
}

export default LLNDAssessmentComplete