import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import HomePage from "./pages/HomePage";
import NavigationPage from "./pages/NavigationPage";
import QuestionPage from "./pages/QuestionPage";
import "./App.css"

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/question/:subject/:id" element={<QuestionPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}