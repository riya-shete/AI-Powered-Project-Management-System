import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';



// RetrospectiveComponent with your table and functionality
const RetrospectiveComponent = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Retrospectivemain/>
      </div>
    </div>
  );
};

const Retrospectivemain = () => {
  // Function to get type style
  const getTypeStyle = (type) => {
    switch (type) {
      case 'Discussion':
        return 'bg-orange-100 text-orange-600';
      case 'Improve':
        return 'bg-green-100 text-green-600';
      case 'Keep':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Initial data
  const [rows, setRows] = useState([
    {
      id: 1,
      selected: false,
      feedback: 'Unplanned Task',
      responsible: 'Vivek S.',
      type: 'Discussion',
      repeating: false,
      vote: false,
      owner: 'Karishma',
      isEditing: false
    },
    {
      id: 2,
      selected: false,
      feedback: 'Focus on path',
      responsible: 'Shriraj P.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Reyansh',
      isEditing: false
    },
    {
      id: 3,
      selected: false,
      feedback: 'Improve progress',
      responsible: 'Anand S.',
      type: 'Keep',
      repeating: true,
      vote: false,
      owner: 'Ananya',
      isEditing: false
    },
    {
      id: 4,
      selected: false,
      feedback: 'CSM Team',
      responsible: 'Riya S.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Rudra',
      isEditing: false
    },
    {
      id: 5,
      selected: false,
      feedback: 'Pending Bugs',
      responsible: 'Kalyani B.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Pranav',
      isEditing: false
    }
  ]);

  // Columns definition
  const columns = [
    { id: 'checkbox', label: '', type: 'checkbox' },
    { id: 'feedback', label: 'Feedback', type: 'text' },
    { id: 'actions', label: '', type: 'actions' },
    { id: 'responsible', label: 'Responsible', type: 'text' },
    { id: 'type', label: 'Type', type: 'select' },
    { id: 'repeating', label: 'Repeating ?', type: 'text' },
    { id: 'vote', label: 'Vote', type: 'checkbox' },
    { id: 'owner', label: 'Owner', type: 'text' }
  ];

  // Function to add a new row
  const addNewRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const newRow = {
      id: newId,
      selected: false,
      feedback: '',
      responsible: '',
      type: 'Discussion',
      repeating: false,
      vote: false,
      owner: '',
      isEditing: true // Set new rows to edit mode by default
    };
    setRows([...rows, newRow]);
  };

  // Function to handle checkbox changes
  const handleCheckboxChange = (id, field) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: !row[field] } : row
    ));
  };

  // Function to handle text input changes
  const handleInputChange = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Function to toggle edit mode for a row
  const toggleEditMode = (id) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, isEditing: !row.isEditing } : row
    ));
  };

  // Function to save changes and exit edit mode
  const saveChanges = (id) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, isEditing: false } : row
    ));
  };

  // Function to handle type selection change
  const handleTypeChange = (id, newType) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, type: newType } : row
    ));
  };

  // Function to handle repeating toggle
  const toggleRepeating = (id) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, repeating: !row.repeating } : row
    ));
  };

  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
          <h1 className="text-2xl text-gray-700 font-bold">Retrospectives</h1>
        </div>
      </div>
    </div>

      {/* Table Options */}
      <div className="flex items-center justify-between w-full mb-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">Main Table</span>
        <button className="text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
        <span className="ml-2 text-gray-400">+</span>
      </div>
    </div>
      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          onClick={addNewRow}
        >
          <span>New feedback</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8L22 12L18 16M6 16L2 12L6 8"></path>
          </svg>
          <span>Sort</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filter</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Person</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-200">
              {columns.map((column) => (
                <th key={column.id} className="p-3 font-medium text-gray-600">
                  {column.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-500"
                      onChange={() => {
                        const allSelected = rows.every((row) => row.selected);
                        setRows(
                          rows.map((row) => ({
                            ...row,
                            selected: !allSelected
                          }))
                        );
                      }}
                      checked={
                        rows.length > 0 && rows.every((row) => row.selected)
                      }
                    />
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-200 hover:bg-blue-50"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-500"
                    checked={row.selected}
                    onChange={() => handleCheckboxChange(row.id, 'selected')}
                  />
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={row.feedback}
                      onChange={(e) => handleInputChange(row.id, 'feedback', e.target.value)}
                      placeholder="Enter feedback"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">{row.feedback}</span>
                  )}
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <button 
                      className="flex items-center justify-center bg-green-200 rounded-full w-6 h-6 text-green-600"
                      onClick={() => saveChanges(row.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      className="flex items-center justify-center bg-gray-200 rounded-full w-6 h-6 text-gray-600"
                      onClick={() => toggleEditMode(row.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={row.responsible}
                      onChange={(e) => handleInputChange(row.id, 'responsible', e.target.value)}
                      placeholder="Responsible person"
                    />
                  ) : (
                    <span className="text-blue-600">{row.responsible}</span>
                  )}
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <select
                      className="w-full p-1 border border-gray-300 rounded"
                      value={row.type}
                      onChange={(e) => handleTypeChange(row.id, e.target.value)}
                    >
                      <option value="Discussion">Discussion</option>
                      <option value="Improve">Improve</option>
                      <option value="Keep">Keep</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeStyle(row.type)}`}>
                      {row.type}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-blue-500"
                        checked={row.repeating}
                        onChange={() => toggleRepeating(row.id)}
                      />
                    </div>
                  ) : (
                    <div className="text-center w-full">{row.repeating ? 'Yes' : ''}</div>
                  )}
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-500"
                    checked={row.vote}
                    onChange={() => handleCheckboxChange(row.id, 'vote')}
                  />
                </td>
                <td className="p-3">
                  {row.isEditing ? (
                    <input
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded"
                      value={row.owner}
                      onChange={(e) => handleInputChange(row.id, 'owner', e.target.value)}
                      placeholder="Owner"
                    />
                  ) : (
                    <span className="text-gray-600">{row.owner}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



export default RetrospectiveComponent;
