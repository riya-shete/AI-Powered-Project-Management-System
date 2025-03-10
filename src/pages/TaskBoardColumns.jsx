import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function TaskBoardColumns() {
  const navigate = useNavigate();
  const [selectedColumns, setSelectedColumns] = useState([]);

  const columns = [
    { name: "Owner", icon: "👥" },
    { name: "Status" },
    { name: "Type" },
    { name: "Estimated SP" },
    { name: "Epic" },
    { name: "TaskID" },
    { name: "Priority" },
    { name: "Unplanned ?" },
    { name: "Actual SP" },
  ];

  const toggleColumn = (columnName) => {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((col) => col !== columnName)
        : [...prev, columnName]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-600">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="PMS Logo" className="h-10 w-auto object-contain" />
          <h1 className="text-2xl font-bold">PMS</h1>
        </div>
      </nav>

      {/* Columns Selection Section */}
      <div className="flex flex-col items-center justify-center p-9 mt-9">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to add some of these columns in your tasks board?
          </h2>
          <p className="text-gray-600 mb-6">You can add or remove columns later.</p>

          {/* Column Selection */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {columns.map((column, index) => (
              <label
                key={index}
                className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer text-lg ${
                  selectedColumns.includes(column.name)
                    ? "bg-blue-500 text-white"
                    : "bg-white border-gray-400 hover:bg-gray-200"
                }`}
                onClick={() => toggleColumn(column.name)}
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column.name)}
                  onChange={() => toggleColumn(column.name)}
                  className="hidden"
                />
                {column.icon && <span className="mr-2">{column.icon}</span>}
                {column.name}
              </label>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => navigate("/Integrations")}
              className="bg-gray-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/Dashboard")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
