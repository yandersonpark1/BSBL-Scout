/// react-router-dom allows for client side eouting 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/uploadpage";
import InsightsPage from "./pages/insightspage"; 


/// might have to change Router to browser router when deploying
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path ="/insights/:fileID" element={<InsightsPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
