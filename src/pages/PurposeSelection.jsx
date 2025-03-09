import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function PurposeSelection() {
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const navigate = useNavigate();

  const purposes = ["University", "Work", "Personal", "Nonprofits"];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="PMS Logo" className="h-10 w-auto object-contain" />
          <h1 className="text-2xl font-bold">PMS</h1>
        </div>
      </nav>

      {/* Purpose Selection */}
      <div className="flex flex-col items-center justify-center p-9 mt-9">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl text-center">
          <h2 className="text-3xl text-gray-600 font-bold mb-4">Hey there, what brings you here today?</h2>
          <p className="text-gray-600 mb-6">Choose one option that best fits your purpose.</p>

          {/* Selection Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {purposes.map((purpose) => (
              <button
                key={purpose}
                onClick={() => setSelectedPurpose(purpose)}
                className={`border px-6 py-3 rounded-lg text-lg font-medium transition ${
                  selectedPurpose === purpose
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-400 hover:bg-gray-200"
                }`}
              >
                {purpose}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/signin")}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-600 transition"
            >
              Back
            </button>

            <button
              onClick={() => selectedPurpose && navigate("/TeamInvite")}
              className={`px-5 py-2 rounded-lg font-bold transition ${
                selectedPurpose
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
              disabled={!selectedPurpose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
