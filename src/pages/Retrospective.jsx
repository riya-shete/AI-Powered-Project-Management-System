import React, { useState } from 'react';

const RetrospectiveComponent = () => {
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
      owner: 'Karishma'
    },
    {
      id: 2,
      selected: false,
      feedback: 'Focus on path',
      responsible: 'Shiraj P.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Reyansh'
    },
    {
      id: 3,
      selected: false,
      feedback: 'Improve progress',
      responsible: 'Anand S.',
      type: 'Keep',
      repeating: true,
      vote: false,
      owner: 'Ananya'
    },
    {
      id: 4,
      selected: false,
      feedback: 'CSM Team',
      responsible: 'Riya S.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Rudra'
    },
    {
      id: 5,
      selected: false,
      feedback: 'Pending Bugs',
      responsible: 'Kalyani B.',
      type: 'Improve',
      repeating: false,
      vote: false,
      owner: 'Pranav'
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
    const newId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) + 1 : 1;
    const newRow = {
      id: newId,
      selected: false,
      feedback: '',
      responsible: '',
      type: 'Discussion',
      repeating: false,
      vote: false,
      owner: ''
    };
    setRows([...rows, newRow]);
  };

  // Function to handle checkbox changes
  const handleCheckboxChange = (id, field) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: !row[field] } : row
    ));
  };

  return (
    <div className="w-full bg-white">
      {/* Header with Retrospectives and dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-800">Retrospectives</h1>
          <button className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Table with options */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-700">Main Table</span>
        <button className="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
        <span className="ml-2 text-gray-400">+</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          onClick={addNewRow}
        >
          <span>New feedback</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8L22 12L18 16M6 16L2 12L6 8"></path>
          </svg>
          <span>Sort</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filter</span>
        </button>
        
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              {columns.map(column => (
                <th key={column.id} className="p-3 font-medium text-gray-600">
                  {column.type === 'checkbox' ? (
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-blue-500" 
                      onChange={() => {
                        const allSelected = rows.every(row => row.selected);
                        setRows(rows.map(row => ({ ...row, selected: !allSelected })));
                      }}
                      checked={rows.length > 0 && rows.every(row => row.selected)}
                    />
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-blue-50">
                <td className="p-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-500"
                    checked={row.selected}
                    onChange={() => handleCheckboxChange(row.id, 'selected')}
                  />
                </td>
                <td className="p-3">
                  <span className="font-medium text-gray-800">{row.feedback}</span>
                </td>
                <td className="p-3">
                  <button className="flex items-center justify-center bg-gray-200 rounded-full w-6 h-6 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </td>
                <td className="p-3">
                  <span className="text-blue-600">{row.responsible}</span>
                </td>
                <td className="p-3">
                  <span className={px-3 py-1 rounded-full text-xs font-medium ${getTypeStyle(row.type)}}>
                    {row.type}
                  </span>
                </td>
                <td className="p-3">
                  <div className="text-center w-full">{row.repeating ? 'Yes' : ''}</div>
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
                  <span className="text-gray-600">{row.owner}</span>
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