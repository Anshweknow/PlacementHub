import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { questionsData } from "../data/questionsData";
import "./SkillTest.css";

const SkillTest = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [category, setCategory] = useState(null);
  const [testActive, setTestActive] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // Stores answers for "Back" logic

  // --- Logic: Start Test ---
  const startCategoryTest = (cat) => {
    // Shuffles the 30+ questions and picks 15
    const shuffled = [...questionsData[cat]]
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    setCategory(cat);
    setCurrentQuestions(shuffled);
    setTestActive(true);
    setTimeLeft(900);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers({});
  };

  // --- Logic: Finish Test ---
  const finishTest = useCallback(() => {
    setTestActive(false);
    setShowResult(true);

    // Save to LocalStorage for History
    const history = JSON.parse(localStorage.getItem("testHistory") || "[]");
    const newEntry = {
      category,
      score,
      total: currentQuestions.length,
      date: new Date().toLocaleDateString(),
    };
    localStorage.setItem("testHistory", JSON.stringify([newEntry, ...history]));
  }, [category, score, currentQuestions]);

  // --- Logic: Timer ---
  useEffect(() => {
    let timer;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && testActive) {
      finishTest();
    }
    return () => clearInterval(timer);
  }, [testActive, timeLeft, finishTest]);

  // --- Logic: Handle Selection ---
  const handleAnswer = (selected) => {
    const isCorrect = selected === currentQuestions[currentIndex].answer;
    
    // Track answers to allow score recalculation if user goes "Back"
    const newUserAnswers = { ...userAnswers, [currentIndex]: isCorrect };
    setUserAnswers(newUserAnswers);

    const currentScore = Object.values(newUserAnswers).filter(val => val === true).length;
    setScore(currentScore);

    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- Screen 1: Domain Selection ---
  if (!category) {
    return (
      <div className="skill-test-page animated-bg">
        <div className="selection-card glass-card">
          <h2 className="section-title">Select Domain</h2>
          <div className="category-grid">
            {Object.keys(questionsData).map((cat) => (
              <button key={cat} onClick={() => startCategoryTest(cat)} className="category-btn">
                {cat}
              </button>
            ))}
          </div>
          <button className="back-dash-link" onClick={() => navigate("/student-dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Screen 2: Result Page (Centered) ---
  if (showResult) {
    return (
      <div className="skill-test-page animated-bg">
        <div className="glass-card result-card centered-layout">
          <h2 className="result-heading">Test Finished!</h2>
          <div className="score-circle-wrapper">
            <span className="score-main-text">{score} / {currentQuestions.length}</span>
          </div>
          <p className="result-category-label">{category} Assessment</p>
          <button onClick={() => navigate("/student-dashboard")} className="return-dash-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Screen 3: Active Test ---
  return (
    <div className="skill-test-page animated-bg">
      <div className="test-layout-container">
        
        {/* Header Bar with Timer */}
        <div className="test-header-bar glass-card">
          <div className="domain-info">
            <span className="label">Domain:</span>
            <span className="value">{category}</span>
          </div>
          <div className={`timer-pill ${timeLeft < 60 ? "timer-critical" : ""}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card question-card">
          <div className="q-progress-text">Question {currentIndex + 1} of {currentQuestions.length}</div>
          
          <h3 className="question-text-dark">
            {currentQuestions[currentIndex]?.question}
          </h3>
          
          <div className="options-container">
            {currentQuestions[currentIndex]?.options.map((opt) => (
              <button key={opt} onClick={() => handleAnswer(opt)} className="quiz-option-btn">
                {opt}
              </button>
            ))}
          </div>

          <div className="navigation-actions">
            <button 
              className="nav-btn-secondary" 
              disabled={currentIndex === 0} 
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              ← Previous
            </button>
            
            <button className="nav-btn-secondary" onClick={() => setCurrentIndex(prev => Math.min(prev + 1, currentQuestions.length - 1))}>
              Skip →
            </button>
            
            <button className="finish-early-btn" onClick={finishTest}>Finish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTest;