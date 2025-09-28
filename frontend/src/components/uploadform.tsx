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
      // 1️⃣ Upload CSV
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        const inserted_id = json.inserted_id;

        // 2️⃣ Fetch Strike data
        const strikeRes = await fetch(
          `http://localhost:8000/insights/is_strike_by_id?file_id=${inserted_id}`
        );
        const strikeDataJson = await strikeRes.json();

        // 3️⃣ Fetch Trajectory data
        const trajRes = await fetch(
          `http://localhost:8000/insights/trajectory_by_id?file_id=${inserted_id}`
        );
        const trajDataJson = await trajRes.json();

        // 4️⃣ Navigate to Insights page with both datasets
        navigate("/insights", {
          state: {
            chartData: strikeDataJson.is_strike,
            trajectoryData: trajDataJson.trajectory,
            inserted_id,
          },
        });
      } else {
        setStatus("❌ Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("⚠️ Error connecting to server.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl text-center text-red-500 font-bold mb-4">Upload CSV</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-black file:text-white
            hover:file:bg-red-100"
        />
        {file && <p className="text-gray-600">Selected file: {file.name}</p>}
        <button
          type="submit"
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-300"
        >
          Upload
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}

export default UploadForm;

