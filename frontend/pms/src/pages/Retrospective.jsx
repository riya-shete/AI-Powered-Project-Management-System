import React, { useState, useMemo } from 'react';
import { Search, User, Filter, ArrowDownUp, EyeOff, MoreVertical, Plus, Edit, ThumbsUp } from 'lucide-react';

import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

const RetrospectivesPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Retrospectivesmain />
      </div>
    </div>
  );
};

const Retrospectivesmain = () => {
  const [retrospectives, setRetrospectives] = useState([
    { id: '13455134', feedback: 'Unplanned Task', responsible: 'Vivek S.', type: 'Discussion', repeating: false, owner: 'Karishma', votes: 0, hasVoted: false, animating: false },
    { id: '12451545', feedback: 'Focus on path', responsible: 'Shriraj P.', type: 'Improve', repeating: false, owner: 'Reyansh', votes: 0, hasVoted: false, animating: false },
    { id: '3246151', feedback: 'Improve progress', responsible: 'Anand S.', type: 'Keep', repeating: true, owner: 'Ananya', votes: 0, hasVoted: false, animating: false },
    { id: '64135315', feedback: 'CSM Team', responsible: 'Riya S.', type: 'Improve', repeating: false, owner: 'Rudra', votes: 0, hasVoted: false, animating: false },
    { id: '1464135', feedback: 'Pending Bugs', responsible: 'Kalyani B.', type: 'Improve', repeating: false, owner: 'Pranav', votes: 0, hasVoted: false, animating: false },
  ]);

  const [newRetrospective, setNewRetrospective] = useState({
    feedback: '',
    responsible: '',
    type: 'Discussion',
    repeating: false,
    owner: '',
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRetrospectives, setSelectedRetrospectives] = useState([]);
  const [editingRetrospective, setEditingRetrospective] = useState(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Dropdown States
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Get unique persons and types for dropdowns
  const uniquePersons = [...new Set(retrospectives.map(r => r.responsible))];
  const uniqueTypes = [...new Set(retrospectives.map(r => r.type))];

  // Filtered Retrospectives
  const filteredRetrospectives = useMemo(() => {
    return retrospectives.filter(retro => {
      const matchesSearch = searchQuery 
        ? retro.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
          retro.responsible.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesPerson = personFilter 
        ? retro.responsible === personFilter 
        : true;
      
      const matchesType = typeFilter 
        ? retro.type === typeFilter 
        : true;
      
      return matchesSearch && matchesPerson && matchesType;
    });
  }, [retrospectives, searchQuery, personFilter, typeFilter]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Discussion': return 'bg-orange-100 text-orange-700';
      case 'Improve': return 'bg-green-100 text-green-700';
      case 'Keep': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleVote = (id) => {
    setRetrospectives(prev => 
      prev.map(retro => 
        retro.id === id
          ? { 
              ...retro, 
              votes: retro.hasVoted ? retro.votes - 1 : retro.votes + 1, 
              hasVoted: !retro.hasVoted,
              animating: true
            } 
          : retro
      )
    );

    // Reset animation state after a delay
    setTimeout(() => {
      setRetrospectives(prev => 
        prev.map(retro => 
          retro.id === id
            ? { ...retro, animating: false }
            : retro
        )
      );
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRetrospective(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRetrospective = () => {
    const newId = Math.floor(Math.random() * 10000000).toString();
    
    const retrospectiveToAdd = {
      ...newRetrospective,
      id: newId,
      votes: 0,
      hasVoted: false,
    };
    
    setRetrospectives(prev => [retrospectiveToAdd, ...prev]);
    setNewRetrospective({
      feedback: '',
      responsible: '',
      type: 'Discussion',
      repeating: false,
      owner: '',
    });
    setShowAddForm(false);
  };

  const handleEditRetrospective = (retrospective) => {
    setEditingRetrospective(retrospective);
    setNewRetrospective({
      feedback: retrospective.feedback,
      responsible: retrospective.responsible,
      type: retrospective.type,
      repeating: retrospective.repeating,
      owner: retrospective.owner,
    });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    setRetrospectives(prev => prev.map(retrospective => 
      retrospective.id === editingRetrospective.id 
        ? { ...retrospective, ...newRetrospective } 
        : retrospective
    ));
    setNewRetrospective({
      feedback: '',
      responsible: '',
      type: 'Discussion',
      repeating: false,
      owner: '',
    });
    setEditingRetrospective(null);
    setShowAddForm(false);
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRetrospectives(retrospectives.map(r => r.id));
    } else {
      setSelectedRetrospectives([]);
    }
  };

  const handleRetrospectiveSelect = (retrospectiveId) => {
    if (selectedRetrospectives.includes(retrospectiveId)) {
      setSelectedRetrospectives(prev => prev.filter(id => id !== retrospectiveId));
    } else {
      setSelectedRetrospectives(prev => [...prev, retrospectiveId]);
    }
  };
  
  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
            <h1 className="text-2xl text-gray-700 font-bold">Retrospectives</h1>
          </div>
        </header>

        <div className="flex items-center mb-4">
          <div className="font-medium">Main Table</div>
          <button className="ml-2">
            <MoreVertical size={16} />
          </button>
          <button className="ml-4">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex mb-4 space-x-2 flex-wrap">
          <button 
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingRetrospective(null);
              setNewRetrospective({
                feedback: '',
                responsible: '',
                type: 'Discussion',
                repeating: false,
                owner: '',
              });
              setShowAddForm(true);
            }}
          >
            New Feedback <Plus size={14} className="ml-1" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search feedback"
              className="px-3 py-1.5 text-sm border rounded bg-white pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
          </div>
          <div className="relative">
            <button 
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => {
                setIsPersonDropdownOpen(!isPersonDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
            >
              <User size={14} className="mr-1" /> 
              {personFilter || 'Person'}
            </button>
            {isPersonDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPersonFilter('');
                    setIsPersonDropdownOpen(false);
                  }}
                >
                  All Persons
                </div>
                {uniquePersons.map(person => (
                  <div 
                    key={person}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPersonFilter(person);
                      setIsPersonDropdownOpen(false);
                    }}
                  >
                    {person}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              className="px-3 py-1.5 text-sm border rounded bg-white flex items-center"
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsPersonDropdownOpen(false);
              }}
            >
              <Filter size={14} className="mr-1" /> 
              {typeFilter || 'Type'}
            </button>
            {isTypeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div 
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setTypeFilter('');
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  All Types
                </div>
                {uniqueTypes.map(type => (
                  <div 
                    key={type}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setTypeFilter(type);
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <ArrowDownUp size={14} className="mr-1" /> Sort
          </button>
          <button className="px-3 py-1.5 text-sm border rounded bg-white flex items-center">
            <EyeOff size={14} className="mr-1" /> Hide
          </button>
          <button className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded flex items-center">
            AI
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="w-8 p-3">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={selectAll}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="p-3 text-sm font-medium text-gray-600 w-1/4">Feedback</th>
                <th className="p-3 text-sm font-medium text-gray-600">Responsible</th>
                <th className="p-3 text-sm font-medium text-gray-600">Type</th>
                <th className="p-3 text-sm font-medium text-gray-600">Repeating</th>
                <th className="p-3 text-sm font-medium text-gray-600">Owner</th>
                <th className="p-3 text-sm font-medium text-gray-600">Votes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRetrospectives.map((retrospective) => (
                <tr key={retrospective.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedRetrospectives.includes(retrospective.id)}
                      onChange={() => handleRetrospectiveSelect(retrospective.id)}
                    />
                  </td>
                  <td className="p-3 relative">
                    <div className="flex items-center">
                      <span className="flex-grow">{retrospective.feedback}</span>
                      <button 
                        className="ml-2 text-gray-500 absolute right-3"
                        onClick={() => handleEditRetrospective(retrospective)}
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <a href="#" className="text-blue-600">{retrospective.responsible}</a>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(retrospective.type)}`}>
                      {retrospective.type}
                    </span>
                  </td>
                  <td className="p-3">{retrospective.repeating ? 'Yes' : 'No'}</td>
                  <td className="p-3">{retrospective.owner}</td>
                  <td className="p-3 flex items-center">
                    {retrospective.votes}
                    <button 
                      className={`ml-2 text-gray-500 transform transition-transform duration-300 ease-out ${
                        retrospective.animating 
                          ? 'animate-vote-explosion scale-150' 
                          : ''
                      }`}
                      onClick={() => handleVote(retrospective.id)}
                    >
                      <ThumbsUp 
                        size={14} 
                        color={retrospective.hasVoted ? 'blue' : 'currentColor'}
                        fill={retrospective.hasVoted ? 'blue' : 'none'}
                        className={`${
                          retrospective.animating 
                            ? 'animate-vote-pulse' 
                            : ''
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-3">
              {editingRetrospective ? 'Edit Feedback' : 'Add New Feedback'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <input
                  type="text"
                  name="feedback"
                  value={newRetrospective.feedback}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Feedback"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsible</label>
                <input
                  type="text"
                  name="responsible"
                  value={newRetrospective.responsible}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={newRetrospective.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Discussion">Discussion</option>
                  <option value="Improve">Improve</option>
                  <option value="Keep">Keep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Owner</label>
                <input
                  type="text"
                  name="owner"
                  value={newRetrospective.owner}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Owner Name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <input
                    type="checkbox"
                    name="repeating"
                    checked={newRetrospective.repeating}
                    onChange={(e) => setNewRetrospective(prev => ({ ...prev, repeating: e.target.checked }))}
                    className="mr-2"
                  />
                  Repeating
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={editingRetrospective ? handleSaveEdit : handleAddRetrospective}
                disabled={!newRetrospective.feedback || !newRetrospective.responsible || !newRetrospective.owner}
              >
                {editingRetrospective ? 'Save Changes' : 'Add Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for the vote animation */}
      <style jsx global>{`
        @keyframes votePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.5); }
        }
        @keyframes voteExplosion {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-vote-pulse {
          animation: votePulse 0.6s ease-in-out;
        }
        .animate-vote-explosion {
          animation: voteExplosion 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RetrospectivesPage;