import { CloudArrowUpIcon } from "@heroicons/react/24/outline"; // Make sure you have heroicons installed
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        const inserted_id = json.inserted_id;
      } else {
        setStatus("❌ Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("⚠️ Error connecting to server.");
    }
  };

return (
  <div className="max-w-lg mx-auto p-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
    <h2 className="text-3xl text-center font-extrabold bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent mb-6">
      Upload CSV
    </h2>

    <form onSubmit={handleSubmit} className="space-y-6">
      
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors duration-200"
      >
        <CloudArrowUpIcon className="w-12 h-12 text-blue-400 mb-3" />
        <span className="text-gray-400">
          Click to select a CSV file or drag it here
        </span>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <p className="text-center text-gray-300 italic">
          Selected file: <span className="text-white font-medium">{file.name}</span>
        </p>
      )}

      
      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-400 to-green-400 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-lg"
      >
        Upload
      </button>
    </form>

    {status && (
      <p className="mt-4 text-center text-sm text-gray-300">
        {status}
      </p>
    )}
  </div>
);
}

export default UploadForm;