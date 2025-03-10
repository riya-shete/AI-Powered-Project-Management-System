import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function SprintTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(["Task1", "Task2"]);

  const handleTaskChange = (index, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = value;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, ""]);
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

      {/* Task Input Section */}
      <div className="flex flex-col items-center justify-center p-10 mt-7">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
          <h2 className="text-3xl text-gray-600 font-bold mb-4 text-center">
            Add a few tasks into your 1st sprint
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Each row represents a single task. You can add more info later.
          </p>

          {/* Task Inputs */}
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <input
                key={index}
                type="text"
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          {/* Add More Task Button */}
          <button
            onClick={addTask}
            className="mt-3 w-full px-5 py-2 text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-100 transition text-lg"
          >
            + Add More Tasks
          </button>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate("/TeamInvite")}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/Integrations")}
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