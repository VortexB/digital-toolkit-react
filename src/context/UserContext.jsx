import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    group: null,
    agreedToTerms: false,
    projectTitle: '',
    projectCountry: '',
    projectProvince: '',
    projectCity: '',
    projectTypes: [],
    projectTypeOther: '',
    cisssciusss: '',
  });
  const [answers, setAnswers] = useState({});

  // Load answers from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem('toolkit-answers');
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error('Error loading saved answers:', error);
      }
    }
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('toolkit-answers', JSON.stringify(answers));
    }
  }, [answers]);

  const saveAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer,
        timestamp: new Date().toISOString(),
        group: user.group
      }
    }));
  };

  const getAnswer = (questionId) => {
    return answers[questionId] || null;
  };

  const clearAnswers = () => {
    setAnswers({});
    localStorage.removeItem('toolkit-answers');
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      answers,
      saveAnswer,
      getAnswer,
      clearAnswers
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
