import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import { questionsData } from "../data/questionsData";
import "./SkillTest.css";

const TOTAL_TIME = 15 * 60;
const OPTION_KEYS = ["A", "B", "C", "D", "E"];

const Icon = ({ type, className = "" }) => {
  const icons = {
    code: "</>",
    clock: "◷",
    check: "✓",
    arrow: "→",
    spark: "✦",
    alert: "!",
    trophy: "🏆",
  };

  return (
    <span className={`skill-icon ${className}`} aria-hidden="true">
      {icons[type] || icons.spark}
    </span>
  );
};

const getDifficulty = (questionIndex) => {
  if (questionIndex % 5 === 4) return "Hard";
  if (questionIndex % 3 === 2) return "Medium";
  return "Easy";
};

const getOptionClass = (option, selectedOption, question, showResult) => {
  const isSelected = selectedOption === option;
  const isCorrect = option === question?.answer;

  if (showResult && isCorrect) return "quiz-option-card correct";
  if (showResult && isSelected && !isCorrect) return "quiz-option-card incorrect";
  if (isSelected) return "quiz-option-card selected";
  return "quiz-option-card";
};

const SkeletonLoader = () => (
  <div className="skill-test-page">
    <div className="assessment-shell single-column">
      <div className="loading-card premium-card" role="status" aria-live="polite">
        <div className="spinner" />
        <p>Loading assessment...</p>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="skill-test-page">
    <div className="assessment-shell single-column">
      <div className="error-card premium-card" role="alert">
        <div className="error-mark">
          <Icon type="alert" />
        </div>
        <h2>We could not load this assessment</h2>
        <p>{message}</p>
        <button className="primary-action" onClick={onRetry}>Retry assessment</button>
      </div>
    </div>
  </div>
);

const SkillTest = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [category, setCategory] = useState(null);
  const [testActive, setTestActive] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionStates, setQuestionStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = currentQuestions[currentIndex];
  const selectedOption = selectedAnswers[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const skippedCount = Object.values(questionStates).filter((state) => state === "skipped").length;
  const remainingCount = Math.max(currentQuestions.length - answeredCount, 0);
  const completionPercent = currentQuestions.length
    ? Math.round(((currentIndex + 1) / currentQuestions.length) * 100)
    : 0;
  const answeredPercent = currentQuestions.length
    ? Math.round((answeredCount / currentQuestions.length) * 100)
    : 0;

  const score = useMemo(() => (
    currentQuestions.reduce((total, question, index) => (
      selectedAnswers[index] === question.answer ? total + 1 : total
    ), 0)
  ), [currentQuestions, selectedAnswers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startCategoryTest = (cat) => {
    setIsLoading(true);
    setError("");

    window.setTimeout(() => {
      const questionBank = questionsData[cat] || [];
      if (!questionBank.length) {
        setIsLoading(false);
        setError("This domain does not have questions yet. Please choose another domain.");
        return;
      }

      const shuffled = [...questionBank]
        .sort(() => 0.5 - Math.random())
        .slice(0, 15);

      setCategory(cat);
      setCurrentQuestions(shuffled);
      setTestActive(true);
      setTimeLeft(TOTAL_TIME);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setQuestionStates({ 0: "current" });
      setShowResult(false);
      setIsLoading(false);
    }, 350);
  };

  const finishTest = useCallback(() => {
    setTestActive(false);
    setShowResult(true);

    if (token) {
      axios.post(
        getApiUrl("/profile/test-result"),
        { category, score, total: currentQuestions.length },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => null);
    }
  }, [category, currentQuestions.length, score, token]);

  const markCurrentBeforeMove = useCallback((stateOverride) => {
    setQuestionStates((prev) => ({
      ...prev,
      [currentIndex]: stateOverride || (selectedAnswers[currentIndex] ? "answered" : "visited"),
    }));
  }, [currentIndex, selectedAnswers]);

  const goToQuestion = useCallback((nextIndex, stateOverride) => {
    if (nextIndex < 0 || nextIndex >= currentQuestions.length) return;
    markCurrentBeforeMove(stateOverride);
    setCurrentIndex(nextIndex);
    setQuestionStates((prev) => ({ ...prev, [nextIndex]: "current" }));
  }, [currentQuestions.length, markCurrentBeforeMove]);

  const handleSelectOption = useCallback((option) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setQuestionStates((prev) => ({ ...prev, [currentIndex]: "answered" }));
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    if (currentIndex + 1 < currentQuestions.length) {
      goToQuestion(currentIndex + 1, "skipped");
    } else {
      setQuestionStates((prev) => ({ ...prev, [currentIndex]: "skipped" }));
      finishTest();
    }
  }, [currentIndex, currentQuestions.length, finishTest, goToQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < currentQuestions.length) {
      goToQuestion(currentIndex + 1);
    } else {
      finishTest();
    }
  }, [currentIndex, currentQuestions.length, finishTest, goToQuestion]);

  useEffect(() => {
    let timer;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && testActive) {
      window.setTimeout(finishTest, 0);
    }
    return () => clearInterval(timer);
  }, [finishTest, testActive, timeLeft]);

  useEffect(() => {
    if (!testActive) return undefined;

    const handleKeyDown = (event) => {
      const options = currentQuestion?.options || [];
      const selectedIndex = options.findIndex((option) => option === selectedOption);

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        if (document.activeElement?.classList?.contains("palette-dot")) return;
        const nextOption = options[(Math.max(selectedIndex, -1) + 1) % options.length];
        if (nextOption) handleSelectOption(nextOption);
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (document.activeElement?.classList?.contains("palette-dot")) return;
        const nextOption = options[(selectedIndex <= 0 ? options.length : selectedIndex) - 1];
        if (nextOption) handleSelectOption(nextOption);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, handleNext, handleSelectOption, selectedOption, testActive]);

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return <ErrorState message={error} onRetry={() => setError("")} />;
  }

  if (!category) {
    return (
      <div className="skill-test-page">
        <main className="assessment-shell single-column selection-shell">
          <section className="premium-card selection-card animate-rise">
            <div className="eyebrow"><Icon type="spark" /> Skill Assessment Center</div>
            <h1>Choose your assessment domain</h1>
            <p>
              Select a focused 15-question multiple-choice test. You will get a timed,
              distraction-free workspace with progress tracking and keyboard support.
            </p>
            <div className="category-grid" aria-label="Assessment domains">
              {Object.keys(questionsData).map((cat) => (
                <button key={cat} onClick={() => startCategoryTest(cat)} className="category-card">
                  <span className="category-icon"><Icon type="code" /></span>
                  <span>{cat}</span>
                  <small>15 Questions • 15 Minutes</small>
                </button>
              ))}
            </div>
            <button className="secondary-action dashboard-link" onClick={() => navigate("/student-dashboard")}>Back to Dashboard</button>
          </section>
        </main>
      </div>
    );
  }

  if (showResult) {
    const resultPercent = currentQuestions.length ? Math.round((score / currentQuestions.length) * 100) : 0;
    return (
      <div className="skill-test-page">
        <main className="assessment-shell single-column">
          <section className="premium-card result-card animate-rise" aria-live="polite">
            <div className="success-orbit"><Icon type="trophy" /></div>
            <div className="eyebrow"><Icon type="check" /> Assessment Complete</div>
            <h1>{resultPercent >= 70 ? "Excellent work!" : "Assessment submitted"}</h1>
            <p className="result-copy">Your {category} assessment has been recorded.</p>
            <div className="score-ring" style={{ "--score": `${resultPercent}%` }}>
              <span>{score}</span>
              <small>/ {currentQuestions.length}</small>
            </div>
            <div className="result-stats">
              <span><strong>{resultPercent}%</strong> Score</span>
              <span><strong>{answeredCount}</strong> Answered</span>
              <span><strong>{skippedCount}</strong> Skipped</span>
            </div>
            <button onClick={() => navigate("/student-dashboard")} className="primary-action">Return to Dashboard</button>
          </section>
        </main>
      </div>
    );
  }

  const timerClass = timeLeft < 60 ? "critical" : timeLeft < 300 ? "warning" : "";

  return (
    <div className="skill-test-page">
      <main className="assessment-shell">
        <section className="assessment-main">
          <header className="assessment-header premium-card animate-rise">
            <div className="header-domain">
              <div className="domain-badge"><Icon type="code" /></div>
              <div>
                <h1>{category} Assessment</h1>
                <p>{currentQuestions.length} Questions • Multiple Choice</p>
              </div>
            </div>

            <div className="header-progress" aria-label={`${completionPercent}% completed`}>
              <div className="progress-meta">
                <span>Question {currentIndex + 1} of {currentQuestions.length}</span>
                <strong>{completionPercent}% completed</strong>
              </div>
              <div className="progress-track"><span style={{ width: `${completionPercent}%` }} /></div>
            </div>

            <div className={`timer-pill ${timerClass}`} aria-label={`Time left ${formatTime(timeLeft)}`}>
              <Icon type="clock" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </header>

          <article key={currentQuestion?.id || currentIndex} className="question-card premium-card question-transition">
            <div className="question-topline">
              <span className="pill-badge primary">Question {currentIndex + 1}</span>
              <span className={`pill-badge ${getDifficulty(currentIndex).toLowerCase()}`}>{getDifficulty(currentIndex)}</span>
              <span className="pill-badge neutral">{category}</span>
            </div>

            <h2>{currentQuestion?.question}</h2>

            {currentQuestion?.code && (
              <pre className="code-block"><code>{currentQuestion.code}</code></pre>
            )}

            <div className="options-container" role="radiogroup" aria-label="Answer choices">
              {currentQuestion?.options.map((opt, optionIndex) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={getOptionClass(opt, selectedOption, currentQuestion, false)}
                  role="radio"
                  aria-checked={selectedOption === opt}
                >
                  <span className="option-letter">{OPTION_KEYS[optionIndex]}</span>
                  <span className="option-text">{opt}</span>
                  {selectedOption === opt && <Icon type="check" className="option-check" />}
                </button>
              ))}
            </div>
          </article>

          <nav className="bottom-navigation premium-card animate-rise" aria-label="Assessment navigation">
            <button
              className="secondary-action"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
            >
              ← Previous
            </button>
            <div className="question-count" aria-live="polite">{currentIndex + 1} / {currentQuestions.length}</div>
            <div className="nav-actions-right">
              <button className="secondary-action" onClick={handleSkip}>Skip</button>
              <button className="primary-action" onClick={handleNext}>
                {currentIndex + 1 === currentQuestions.length ? "Finish Assessment" : "Next"}
                <Icon type="arrow" />
              </button>
            </div>
          </nav>
        </section>

        <aside className="assessment-sidebar premium-card animate-rise" aria-label="Question palette and statistics">
          <div className="sidebar-section">
            <h2>Question Palette</h2>
            <div className="palette-grid">
              {currentQuestions.map((question, index) => {
                const state = index === currentIndex ? "current" : questionStates[index] || "not-visited";
                return (
                  <button
                    key={question.id || index}
                    className={`palette-dot ${state}`}
                    onClick={() => goToQuestion(index)}
                    aria-label={`Go to question ${index + 1}, ${state.replace("-", " ")}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="legend-list">
            <span><i className="legend-dot not-visited" /> Not Visited</span>
            <span><i className="legend-dot current" /> Current</span>
            <span><i className="legend-dot answered" /> Answered</span>
            <span><i className="legend-dot skipped" /> Skipped</span>
          </div>

          <div className="quick-stats">
            <div><strong>{answeredCount}</strong><span>Answered</span></div>
            <div><strong>{remainingCount}</strong><span>Remaining</span></div>
            <div><strong>{formatTime(timeLeft)}</strong><span>Time left</span></div>
          </div>

          <div className="answered-progress">
            <div className="progress-meta"><span>Overall progress</span><strong>{answeredPercent}%</strong></div>
            <div className="progress-track"><span style={{ width: `${answeredPercent}%` }} /></div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default SkillTest;
