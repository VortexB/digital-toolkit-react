import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import HomePage from "./pages/HomePage";
import NavigationPage from "./pages/NavigationPage";
import QuestionPage from "./pages/QuestionPage";
import LanguageToggle from "./components/LanguageToggle";
import "./App.css"

export default function App() {
  return (
    <UserProvider>
      <LanguageProvider>
        <Router>
          <LanguageToggle />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/navigation" element={<NavigationPage />} />
            <Route path="/question/:subject/:id" element={<QuestionPage />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </UserProvider>
  );
}