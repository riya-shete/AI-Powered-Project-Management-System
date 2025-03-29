import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

const RetrospectiveComponent = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Retrospectivemain />
      </div>
    </div>
  );
};

const Retrospectivemain = () => {
  const [rows, setRows] = useState([
    { id: 1, feedback: 'Unplanned Task', responsible: 'Vivek S.', type: 'Discussion', repeating: false, vote: false, owner: 'Karishma' },
    { id: 2, feedback: 'Focus on path', responsible: 'Shriraj P.', type: 'Improve', repeating: false, vote: false, owner: 'Reyansh' },
    { id: 3, feedback: 'Improve progress', responsible: 'Anand S.', type: 'Keep', repeating: true, vote: false, owner: 'Ananya' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    feedback: '',
    responsible: '',
    type: 'Discussion',
    repeating: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback({ ...newFeedback, [name]: value });
  };

  const handleRepeatingChange = () => {
    setNewFeedback({ ...newFeedback, repeating: !newFeedback.repeating });
  };

  const addNewRow = () => {
    if (newFeedback.feedback && newFeedback.responsible) {
      const newId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
      setRows([...rows, { id: newId, ...newFeedback, vote: false, owner: 'N/A' }]);
      setIsModalOpen(false);
      setNewFeedback({ feedback: '', responsible: '', type: 'Discussion', repeating: false });
    }
  };

  return (
    <div className="flex-1 overflow-auto w-full h-full p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Retrospectives</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setIsModalOpen(true)}
        >
          New Feedback
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Feedback</h2>
            <label className="block mb-2">Feedback Name</label>
            <input
              type="text"
              name="feedback"
              value={newFeedback.feedback}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter feedback"
            />

            <label className="block mb-2">Responsible</label>
            <input
              type="text"
              name="responsible"
              value={newFeedback.responsible}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter responsible person"
            />

            <label className="block mb-2">Type</label>
            <select
              name="type"
              value={newFeedback.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="Discussion">Discussion</option>
              <option value="Improve">Improve</option>
              <option value="Keep">Keep</option>
            </select>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newFeedback.repeating}
                onChange={handleRepeatingChange}
                className="mr-2"
              />
              <span>Repeating?</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={addNewRow}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrospectiveComponent;
