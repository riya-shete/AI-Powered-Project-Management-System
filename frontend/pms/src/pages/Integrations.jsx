import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Integrations() {
  const navigate = useNavigate();
  const [selectedTools, setSelectedTools] = useState([]);

  const tools = [
    "Github",
    "Gitlab",
    "Jira",
    "Gmail",
    "Google Calendar",
    "Microsoft Teams",
  ];

  const toggleTool = (tool) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="PMS Logo" className="h-10 w-auto object-contain" />
          <h1 className="text-2xl font-bold">PMS</h1>
        </div>
      </nav>

      {/* Integrations Section */}
      <div className="flex flex-col items-center justify-center p-9 mt-9">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl text-center">
          <h2 className="text-3xl text-gray-600 font-bold mb-4">Do you use any of these tools?</h2>

          {/* Tool Selection */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mt-6">
            {tools.map((tool, index) => (
              <label
                key={index}
                className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer text-lg ${
                  selectedTools.includes(tool) ? "bg-blue-500 text-white" : "bg-white border-gray-400"
                }`}
                onClick={() => toggleTool(tool)}
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                  className="hidden"
                />
                {tool}
              </label>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/SprintTasks")}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/TaskBoardColumns")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
