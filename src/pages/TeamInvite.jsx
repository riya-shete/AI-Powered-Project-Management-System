import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function TeamInvite() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([{ email: "", role: "Developer" }]);
  const [invited, setInvited] = useState(false);
  const [role, setRole] = useState("Developer");
  const [autoSignUp, setAutoSignUp] = useState(true);

  const handleEmailChange = (index, field, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index][field] = value;
    setEmails(updatedEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, { email: "", role: "Developer" }]);
  };

  const handleInvite = () => {
    alert("Invitation sent! Please check your email and accept the request.");
    setInvited(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full bg-blue-600 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="PMS Logo" className="h-12 w-auto object-contain" />
          <h1 className="text-2xl font-bold">PMS</h1>
        </div>
      </nav>

      {/* Invite Section */}
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-600 mb-6 text-center">Who else is on your team?</h2>
          
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-600 mb-2">What is your role in Project Management?</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-lg"
            >
              <option value="Developer">Developer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="Designer">Designer</option>
            </select>
          </div>

          {/* Email Inputs */}
          <p className="text-gray-600 text-lg mb-4 font-medium">Enter email to send an invite link to your team</p>
          <div className="space-y-5">
            {emails.map((entry, index) => (
              <div key={index} className="flex space-x-4 items-center">
                <input
                  type="email"
                  value={entry.email}
                  onChange={(e) => handleEmailChange(index, "email", e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-lg"
                />
                <select
                  value={entry.role}
                  onChange={(e) => handleEmailChange(index, "role", e.target.value)}
                  className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg"
                >
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="HR">HR</option>
                  <option value="Admin">Admin</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Designer">Designer</option>
                </select>
              </div>
            ))}
          </div>

          {/* Add More Emails Button */}
          <button
            onClick={addEmailField}
            className="mt-5 px-5 py-3 text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-100 transition text-lg"
          >
            + Add another
          </button>

          {/* Auto Sign-up Checkbox */}
          <div className="flex items-center justify-start mt-6 space-x-2">
            <input
              type="checkbox"
              id="autoSignUp"
              checked={autoSignUp}
              onChange={() => setAutoSignUp(!autoSignUp)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="autoSignUp" className="text-gray-700 text-lg">Allow Auto Sign-up</label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between w-full mt-8">
            <button 
              onClick={() => navigate("/purpose-selection")} 
              className="bg-gray-600 text-white px-7 py-3 rounded-lg font-bold hover:bg-gray-700 transition text-lg"
            >
              Back
            </button>

            <button 
              onClick={invited ? () => navigate("/SprintTasks") : handleInvite}
              className={`px-7 py-3 rounded-lg font-bold transition text-lg ${
                invited 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {invited ? "Next" : "Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
