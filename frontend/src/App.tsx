// react-router-dom provides client-side routing.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/upload-page";
import SamplePage from "./pages/sample-page";
import DashboardPage from "./pages/dashboard-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/sample" element={<SamplePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
