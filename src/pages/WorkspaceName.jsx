import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function WorkspaceName() {
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState("");

  const handleWorkspaceNameChange = (e) => {
    setWorkspaceName(e.target.value);
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

      {/* Workspace Name Input Section */}
      <div className="flex flex-col items-center justify-center p-10 mt-7">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
          <h2 className="text-3xl text-gray-600 font-bold mb-4 text-center">
            Name your workspace
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Enter your workspace name. You can change it later.
          </p>

          {/* Workspace Name Input */}
          <div className="space-y-3">
            <input
              type="text"
              value={workspaceName}
              onChange={handleWorkspaceNameChange}
              placeholder="Workspace Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/TeamInvite")}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/SprintTasks")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              disabled={!workspaceName.trim()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}