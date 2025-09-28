import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/uploadpage";      // your current landing page
import InsightsPage from "./pages/insightspage"; // new page for charts

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
