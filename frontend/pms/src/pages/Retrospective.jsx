"use client"

import { useState, useMemo, useEffect, useContext} from "react";
import { UserContext } from "../contexts/UserContext";
import {
  Search,
  User,
  Filter,
  ArrowDownUp,
  EyeOff,
  MoreVertical,
  Plus,
  Edit,
  ThumbsUp,
  Settings,
  X,
} from "lucide-react"
import Lottie from "lottie-react";
import glass from '../assets/search_retro.json';
import axios from "axios";
import { useParams } from "react-router-dom";

import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"

const RetrospectivesPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Retrospectivesmain />
      </div>
    </div>
  )
}

const Retrospectivesmain = () => {
  const [retrospectives, setRetrospectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { projectId } = useParams();

  // Save retrospectives to localStorage whenever they change
    // Fetch retrospectives from API
  useEffect(() => {
    const fetchRetrospectives = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        
        const response = await axios.get("http://localhost:8000/api/retrospectives/", {
          headers: {
            Authorization: `Token ${token}`,
            'X-Project-ID': projectId || '1'
          }
        });

        if (response.data && typeof response.data === "object") {

          const results =
          response.data.results ||
          response.data.data ||
          (Array.isArray(response.data) ? response.data : []);

        if (Array.isArray(results)) {
          const transformedRetros = results.map((retro) => ({
            id: retro.id,
            feedback: retro.feedback,
            responsible: retro.responsible ? retro.responsible.username : "Unassigned",
            type: retro.type,
            repeating: retro.repeating || false,
            owner: retro.owner || "Unknown",
            votes: retro.votes || 0,
            hasVoted: retro.has_voted || false,
            animating: false
          }));
          setRetrospectives(transformedRetros);
        } else {
          setError("Failed to fetch retrospectives. Invalid data format.");
        }
        } else{
          setError("Failed to fetch retrospectives. Invalid data format.");
        }
        
        setLoading(false);
      } catch (error) {
        console.log("Error fetching retrospective",error);
        setLoading(false);
        setError(error.message || "Failed to fetch retrospectives.");
      }
    };
    
    fetchRetrospectives();
  }, [projectId]);

  // Load columns from localStorage if available
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem("retroColumns")
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          { id: "checkbox", label: "", type: "checkbox", visible: true, width: "40px", order: 0 },
          { id: "feedback", label: "Feedback", type: "text", visible: true, width: "25%", order: 1 },
          { id: "responsible", label: "Responsible", type: "text", visible: true, width: "15%", order: 2 },
          { id: "type", label: "Type", type: "type", visible: true, width: "15%", order: 3 },
          { id: "repeating", label: "Repeating", type: "boolean", visible: true, width: "10%", order: 4 },
          { id: "owner", label: "Owner", type: "text", visible: true, width: "15%", order: 5 },
          { id: "votes", label: "Votes", type: "votes", visible: true, width: "10%", order: 6 },
        ]
  })

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("retroColumns", JSON.stringify(columns))
  }, [columns])

  const [newRetrospective, setNewRetrospective] = useState({
    feedback: "",
    responsible: "",
    type: "Discussion",
    repeating: false,
    owner: "",
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedRetrospectives, setSelectedRetrospectives] = useState([])
  const [editingRetrospective, setEditingRetrospective] = useState(null)

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [personFilter, setPersonFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  // Dropdown States
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)

  // Column management state
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [editingColumn, setEditingColumn] = useState(null)
  const [newColumnData, setNewColumnData] = useState({ label: "", type: "text" })
  const [isResizing, setIsResizing] = useState(false)
  const [columnBeingModified, setColumnBeingModified] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // Cell editing state
  const [editingCell, setEditingCell] = useState(null)
  const [cellValue, setCellValue] = useState("")

  // Get unique persons and types for dropdowns
  const uniquePersons = [...new Set(retrospectives.map((r) => r.responsible))]
  const uniqueTypes = [...new Set(retrospectives.map((r) => r.type))]

  // Filtered Retrospectives
  const filteredRetrospectives = useMemo(() => {
    return retrospectives.filter((retro) => {
      const matchesSearch = searchQuery
        ? retro.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
          retro.responsible.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesPerson = personFilter ? retro.responsible === personFilter : true

      const matchesType = typeFilter ? retro.type === typeFilter : true

      return matchesSearch && matchesPerson && matchesType
    })
  }, [retrospectives, searchQuery, personFilter, typeFilter])

  const getTypeColor = (type) => {
    switch (type) {
      case "Discussion":
        return "bg-orange-100 text-orange-700"
      case "Improve":
        return "bg-green-100 text-green-700"
      case "Keep":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

    const handleVote = async (id) => {
    try {
      const retroToUpdate = retrospectives.find(r => r.id === id);
      const newVoteState = !retroToUpdate.hasVoted;
      const token = localStorage.getItem("token");
      
      // Optimistic UI update
      setRetrospectives(prev =>
        prev.map(retro =>
          retro.id === id
            ? {
                ...retro,
                votes: newVoteState ? retro.votes + 1 : retro.votes - 1,
                hasVoted: newVoteState,
                animating: true
              }
            : retro
        )
      );

      // API call
      await axios.patch(
        `http://localhost:8000/api/retrospectives/${id}/vote/`,
        { has_voted: newVoteState },
        {
          headers: {
            Authorization: `Token ${token}`,
            'X-Project-ID': projectId || '1'
          }
        }
      );

      // Reset animation after delay
      setTimeout(() => {
        setRetrospectives(prev =>
          prev.map(retro => (retro.id === id ? { ...retro, animating: false } : retro))
        );
      }, 800);
    } catch (error) {
      console.error("Error voting:", error);
      // Revert optimistic update on error
      setRetrospectives(prev =>
        prev.map(retro =>
          retro.id === id
            ? {
                ...retro,
                votes: retro.hasVoted ? retro.votes - 1 : retro.votes + 1,
                hasVoted: !retro.hasVoted,
                animating: false
              }
            : retro
        )
      );
    }
  };

  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target
  setNewRetrospective((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }))
}

    const handleAddRetrospective = async () => {
    try {
      const token = localStorage.getItem("token");
      const newRetro = {
        feedback: newRetrospective.feedback,
        responsible: newRetrospective.responsible,
        type: newRetrospective.type,
        repeating: newRetrospective.repeating,
        owner: newRetrospective.owner,
      };

      const response = await axios.post(
        "http://localhost:8000/api/retrospectives/",
        newRetro,
        {
          headers: {
            Authorization: `Token ${token}`,
            'X-Project-ID': projectId || '1',
            'Content-Type': 'application/json'
          }
        }
      );

      setRetrospectives(prev => [{
        ...response.data,
        id: response.data.id,
        responsible: response.data.responsible || "Unassigned",
        owner: response.data.owner || "Unknown",
        votes: 0,
        hasVoted: false,
        animating: false
      }, ...prev]);
      
      setNewRetrospective({
        feedback: "",
        responsible: "",
        type: "Discussion",
        repeating: false,
        owner: "",
      });
      setShowAddForm(false);
      setResponsibleSearch('');
      setOwnerSearch('');
      setIsResponsibleDropdownOpen(false);
      setIsOwnerDropdownOpen(false);
    } catch (error) {
      console.error("Error creating retrospective:", error);
      alert("Failed to create retrospective. Please try again.");
    }
  };

  const handleEditRetrospective = (retrospective) => {
    setEditingRetrospective(retrospective)
    setNewRetrospective({
      feedback: retrospective.feedback,
      responsible: retrospective.responsible,
      type: retrospective.type,
      repeating: retrospective.repeating,
      owner: retrospective.owner,
    })
    setShowAddForm(true);
    setResponsibleSearch(retrospective.responsible);
    setOwnerSearch(retrospective.owner);
    setIsResponsibleDropdownOpen(false);
    setIsTypeDropdownOpen(false);
  }

  //Initialize State for Dropdowns
  const { users } = useContext(UserContext);
  const [responsibleSearch, setResponsibleSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [isResponsibleDropdownOpen, setIsResponsibleDropdownOpen] = useState(false);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);

  const [retrospectiveData, setRetrospectiveData] = useState({
    responsible: null,
    owner: null,
  });

  //Handle both arrays depending on whether users are stored as users.results or directly as users.
  const userList = users.results || users || [];
  const filteredResponsibleUsers = userList.filter(user =>
    user.username.toLowerCase().includes(responsibleSearch.toLowerCase())
  );

  const filteredOwnerUsers = userList.filter(user =>
    user.username.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  //Click Outside to Close Dropdowns
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.searchable-dropdown')) {
      setIsResponsibleDropdownOpen(false);
      setIsOwnerDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


    const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        feedback: newRetrospective.feedback,
        responsible: newRetrospective.responsible,
        type: newRetrospective.type,
        repeating: newRetrospective.repeating,
        owner: newRetrospective.owner
      };

      const response = await axios.put(
        "http://localhost:8000/api/retrospectives/",
        updatedData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
            'X-Object-ID': projectId || 1,
          }
        }
      );

      setRetrospectives(prev =>
        prev.map(retro =>
          retro.id === editingRetrospective.id
            ? {
                ...retro,
                ...response.data,
                responsible: response.data.responsible || "Unassigned",
                owner: response.data.owner || "Unknown"
              }
            : retro
        )
      );
      
      setEditingRetrospective(null);
      setShowAddForm(false);
      
      setIsResponsibleDropdownOpen(false);
      setIsOwnerDropdownOpen(false);
    } catch (error) {
      console.error("Error updating retrospective:", error);
      alert("Failed to update retrospective. Please try again.");
    }
  };

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedRetrospectives(retrospectives.map((r) => r.id))
    } else {
      setSelectedRetrospectives([])
    }
  }

  const handleRetrospectiveSelect = (retrospectiveId) => {
    if (selectedRetrospectives.includes(retrospectiveId)) {
      setSelectedRetrospectives((prev) => prev.filter((id) => id !== retrospectiveId))
    } else {
      setSelectedRetrospectives((prev) => [...prev, retrospectiveId])
    }
  }

  // Add a click handler to close the selected column when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the table headers
      if (selectedColumn && !event.target.closest("th")) {
        setSelectedColumn(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectedColumn])

  // Column resizing
  const handleResizeStart = (e, columnId) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setColumnBeingModified(columnId)
    setStartX(e.clientX)

    const column = columns.find((col) => col.id === columnId)
    setStartWidth(Number.parseInt(column.width))

    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  const handleResizeMove = (e) => {
    if (!isResizing) return

    const diff = e.clientX - startX
    const newWidth = Math.max(50, startWidth + diff)

    setColumns((prev) => prev.map((col) => (col.id === columnBeingModified ? { ...col, width: `${newWidth}px` } : col)))
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    setColumnBeingModified(null)
    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("mouseup", handleResizeEnd)
  }

  // Column reordering
  const handleColumnDragStart = (columnId) => {
    setDraggedColumn(columnId)
  }

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault()
    if (draggedColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleColumnDrop = (e) => {
    e.preventDefault()
    if (draggedColumn && dragOverColumn) {
      const draggedIndex = columns.findIndex((col) => col.id === draggedColumn)
      const dropIndex = columns.findIndex((col) => col.id === dragOverColumn)

      if (draggedIndex !== -1 && dropIndex !== -1) {
        const newColumns = [...columns]
        const [removed] = newColumns.splice(draggedIndex, 1)
        newColumns.splice(dropIndex, 0, removed)

        // Update order property
        const reorderedColumns = newColumns.map((col, index) => ({
          ...col,
          order: index,
        }))

        setColumns(reorderedColumns)
      }
    }

    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  // Column management functions
  const handleAddColumn = () => {
    setEditingColumn(null)
    setNewColumnData({ label: "", type: "text" })
    setShowColumnModal(true)
  }

  const handleEditColumn = (column) => {
    setEditingColumn(column)
    setNewColumnData({
      label: column.label,
      type: column.type,
      visible: column.visible,
    })
    setShowColumnModal(true)
  }

  const handleColumnInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewColumnData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSaveColumn = () => {
    if (editingColumn) {
      // Update existing column
      setColumns((prev) =>
        prev.map((col) =>
          col.id === editingColumn.id
            ? { ...col, label: newColumnData.label, type: newColumnData.type, visible: newColumnData.visible !== false }
            : col,
        ),
      )
    } else {
      // Add new column
      const newId = `custom_${Date.now()}`
      setColumns((prev) => [
        ...prev,
        {
          id: newId,
          label: newColumnData.label,
          type: newColumnData.type,
          visible: true,
          width: "150px",
          order: prev.length,
        },
      ])

      // Add this field to all existing retrospectives
      setRetrospectives((prev) => prev.map((retro) => ({ ...retro, [newId]: "" })))
    }

    setShowColumnModal(false)
  }

  const handleDeleteColumn = (columnId) => {
    // Don't allow deleting essential columns
    if (["checkbox", "feedback", "votes"].includes(columnId)) return

    setColumns((prev) => prev.filter((col) => col.id !== columnId))

    // Remove this field from all retrospectives
    setRetrospectives((prev) =>
      prev.map((retro) => {
        const newRetro = { ...retro }
        delete newRetro[columnId]
        return newRetro
      }),
    )
  }

  const handleToggleColumnVisibility = (columnId) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)))
  }

  // Cell editing functions
  const handleCellClick = (retroId, columnId, value) => {
    // Don't allow editing checkbox or votes columns directly
    if (["checkbox", "votes"].includes(columnId)) return

    setEditingCell({ retroId, columnId })
    setCellValue(value !== undefined ? value : "")
  }

  const handleCellChange = (e) => {
    setCellValue(e.target.value)
  }

  const handleCellBlur = () => {
    if (!editingCell) return

    const { retroId, columnId } = editingCell

    // For boolean fields like repeating, we need to convert the string to boolean
    const finalValue = columnId === "repeating" ? cellValue === "Yes" || cellValue === "true" : cellValue

    setRetrospectives((prev) =>
      prev.map((retro) => (retro.id === retroId ? { ...retro, [columnId]: finalValue } : retro)),
    )

    setEditingCell(null)
  }

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCellBlur()
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

// Sort columns by order
const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => a.order - b.order);
}, [columns]);

return (
    loading ? (
        <div className="flex-1 flex items-center justify-center">
            <Lottie animationData={glass} className="w-48 h-48" />
        </div>
    ) : error ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
                >
                    Retry
                </button>
            </div>
        </div>
    ) : (
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
                    <div className="relative">
            <button className="ml-2" onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}>
              <MoreVertical size={16} />
            </button>

            {isColumnMenuOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={handleAddColumn}>
                  <Plus size={14} className="mr-2" />
                  Add Column
                </div>
                <div className="px-3 py-2 border-t">Column Visibility</div>
                {columns.map(
                  (column) =>
                    column.id !== "checkbox" && (
                      <div key={column.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => handleToggleColumnVisibility(column.id)}
                          className="mr-2"
                        />
                        {column.label}
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
          <button className="ml-2" onClick={handleAddColumn}>
            <Plus size={16} />
          </button>
        </div>

        <div className="flex mb-4 space-x-2 flex-wrap">
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingRetrospective(null)
              setNewRetrospective({
                feedback: "",
                responsible: "",
                type: "Discussion",
                repeating: false,
                owner: "",
              })
              setResponsibleSearch('')
              setOwnerSearch('')
              setShowAddForm(true)
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
                setIsPersonDropdownOpen(!isPersonDropdownOpen)
                setIsTypeDropdownOpen(false)
              }}
            >
              <User size={14} className="mr-1" />
              {personFilter || "Person"}
            </button>
            {isPersonDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPersonFilter("")
                    setIsPersonDropdownOpen(false)
                  }}
                >
                  All Persons
                </div>
                {uniquePersons.map((person) => (
                  <div
                    key={person}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPersonFilter(person)
                      setIsPersonDropdownOpen(false)
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
                setIsTypeDropdownOpen(!isTypeDropdownOpen)
                setIsPersonDropdownOpen(false)
              }}
            >
              <Filter size={14} className="mr-1" />
              {typeFilter || "Type"}
            </button>
            {isTypeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setTypeFilter("")
                    setIsTypeDropdownOpen(false)
                  }}
                >
                  All Types
                </div>
                {uniqueTypes.map((type) => (
                  <div
                    key={type}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setTypeFilter(type)
                      setIsTypeDropdownOpen(false)
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
          <button className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded flex items-center">AI</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                {sortedColumns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <th
                      key={column.id}
                      className={`p-3 text-sm font-medium text-gray-600 relative ${selectedColumn === column.id ? "bg-blue-50" : ""}`}
                      style={{ width: column.width }}
                      draggable={column.id !== "checkbox" && column.id !== "votes"}
                      onDragStart={() => handleColumnDragStart(column.id)}
                      onDragOver={(e) => handleColumnDragOver(e, column.id)}
                      onDrop={handleColumnDrop}
                      onClick={() =>
                        column.id !== "checkbox" && setSelectedColumn(column.id === selectedColumn ? null : column.id)
                      }
                    >
                      <div className="flex items-center">
                        {column.id === "checkbox" ? (
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectAll}
                            onChange={handleToggleSelectAll}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <span className="cursor-move">{column.label}</span>

                            {/* Show column options only when the column is selected */}
                            {selectedColumn === column.id && (
                              <div className="ml-auto flex items-center">
                                <button
                                  className="text-gray-400 hover:text-gray-600 ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddColumn()
                                  }}
                                  title="Add column"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-gray-600 ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditColumn(column)
                                  }}
                                  title="Edit column"
                                >
                                  <Settings size={14} />
                                </button>
                                {!["checkbox", "feedback", "votes"].includes(column.id) && (
                                  <button
                                    className="text-gray-400 hover:text-red-600 ml-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteColumn(column.id)
                                    }}
                                    title="Delete column"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Column resize handle */}
                      <div
                        className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-400"
                        onMouseDown={(e) => handleResizeStart(e, column.id)}
                      ></div>

                      {/* Drag indicator */}
                      {dragOverColumn === column.id && (
                        <div className="absolute top-0 left-0 h-full w-1 bg-blue-500"></div>
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredRetrospectives.map((retrospective) => (
                <tr key={retrospective.id} className="border-t hover:bg-gray-50">
                  {sortedColumns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <td key={`${retrospective.id}-${column.id}`} className="p-3">
                        {column.id === "checkbox" ? (
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedRetrospectives.includes(retrospective.id)}
                            onChange={() => handleRetrospectiveSelect(retrospective.id)}
                          />
                        ) : column.id === "feedback" ? (
                          <div className="relative">
                            {editingCell &&
                            editingCell.retroId === retrospective.id &&
                            editingCell.columnId === "feedback" ? (
                              <input
                                type="text"
                                value={cellValue}
                                onChange={handleCellChange}
                                onBlur={handleCellBlur}
                                onKeyDown={handleCellKeyDown}
                                className="w-full p-1 border rounded"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center">
                                <span
                                  className="flex-grow cursor-pointer hover:bg-gray-200 p-1 rounded"
                                  onClick={() => handleCellClick(retrospective.id, "feedback", retrospective.feedback)}
                                >
                                  {retrospective.feedback}
                                </span>
                                <button
                                  className="ml-2 text-gray-500 absolute right-3"
                                  onClick={() => handleEditRetrospective(retrospective)}
                                >
                                  <Edit size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : column.id === "responsible" ? (
                          editingCell &&
                          editingCell.retroId === retrospective.id &&
                          editingCell.columnId === "responsible" ? (
                            <input
                              type="text"
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="w-full p-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            <a
                              href="#"
                              className="text-blue-600 hover:bg-gray-200 p-1 rounded block"
                              onClick={(e) => {
                                e.preventDefault()
                                handleCellClick(retrospective.id, "responsible", retrospective.responsible)
                              }}
                            >
                              {retrospective.responsible}
                            </a>
                          )
                        ) : column.id === "type" ? (
                          editingCell && editingCell.retroId === retrospective.id && editingCell.columnId === "type" ? (
                            <select
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="w-full p-1 border rounded"
                              autoFocus
                            >
                              <option value="Discussion">Discussion</option>
                              <option value="Improve">Improve</option>
                              <option value="Keep">Keep</option>
                            </select>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded inline-block"
                              onClick={() => handleCellClick(retrospective.id, "type", retrospective.type)}
                            >
                              <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(retrospective.type)}`}>
                                {retrospective.type}
                              </span>
                            </div>
                          )
                        ) : column.id === "repeating" ? (
                          editingCell &&
                          editingCell.retroId === retrospective.id &&
                          editingCell.columnId === "repeating" ? (
                            <select
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="w-full p-1 border rounded"
                              autoFocus
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                              onClick={() =>
                                handleCellClick(retrospective.id, "repeating", retrospective.repeating ? "Yes" : "No")
                              }
                            >
                              {retrospective.repeating ? "Yes" : "No"}
                            </div>
                          )
                        ) : column.id === "owner" ? (
                          editingCell &&
                          editingCell.retroId === retrospective.id &&
                          editingCell.columnId === "owner" ? (
                            <input
                              type="text"
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="w-full p-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                              onClick={() => handleCellClick(retrospective.id, "owner", retrospective.owner)}
                            >
                              {retrospective.owner}
                            </div>
                          )
                        ) : column.id === "votes" ? (
                          <div className="flex items-center">
                            {retrospective.votes}
                            <button
                              className={`ml-2 text-gray-500 transform transition-transform duration-300 ease-out ${
                                retrospective.animating ? "animate-vote-explosion scale-150" : ""
                              }`}
                              onClick={() => handleVote(retrospective.id)}
                            >
                              <ThumbsUp
                                size={14}
                                color={retrospective.hasVoted ? "blue" : "currentColor"}
                                fill={retrospective.hasVoted ? "blue" : "none"}
                                className={`${retrospective.animating ? "animate-vote-pulse" : ""}`}
                              />
                            </button>
                          </div>
                        ) : editingCell &&
                          editingCell.retroId === retrospective.id &&
                          editingCell.columnId === column.id ? (
                          <input
                            type="text"
                            value={cellValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleCellKeyDown}
                            className="w-full p-1 border rounded"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                            onClick={() => handleCellClick(retrospective.id, column.id, retrospective[column.id])}
                          >
                            {retrospective[column.id] || ""}
                          </div>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* creation modal*/}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-3">{editingRetrospective ? "Edit Feedback" : "Add New Feedback"}</h3>
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

              {/* Responsible dropdown */}
              <div className = "relative searchable-dropdown mt-4">
                <label className="block text-sm font-medium mb-1">Responsible</label>
                <input
                  type="text"
                  value={responsibleSearch}
                  onChange={(e)=>setResponsibleSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  onFocus={() => setIsResponsibleDropdownOpen(true)}
                  placeholder="Responsible user"
                />
                {isResponsibleDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
                    {filteredResponsibleUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setRetrospectiveData(prev => ({ ...prev, responsible: user.username })); 
                          setResponsibleSearch(user.username);
                          setIsResponsibleDropdownOpen(false);
                        }}
                      >
                        {user.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1">Type</label>
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

              {/* Owner Dropdown */}
              <div className ="relative searchable-dropdown mt-4">
                <label className="block text-sm font-medium mb-1">Owner</label>
                <input
                  type="text"
                  className = "w-full border border-gray-300 rounded p-2 text-sm"
                  name="owner"
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  onFocus={() => setIsOwnerDropdownOpen(true)}
                  placeholder="Search owner..."
                />
                  {isOwnerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
                      {filteredOwnerUsers.map(user => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setNewRetrospective(prev => ({ ...prev, owner: user.username })); 
                            setOwnerSearch(user.username);
                            setIsOwnerDropdownOpen(false);
                          }}
                        >
                          {user.username}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 flex items-center">
                  <input
                    type="checkbox"
                    name="repeating"
                    checked={newRetrospective.repeating}
                    onChange={(e) => setNewRetrospective((prev) => ({ ...prev, repeating: e.target.checked }))}
                    className="mr-2"
                  />
                  Repeating
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 border rounded hover:bg-gray-100" onClick={() => {
                    setShowAddForm(false)
                    setResponsibleSearch("") //  Reset
                    setOwnerSearch("")       //  Reset
                    setIsResponsibleDropdownOpen(false) 
                    setIsOwnerDropdownOpen(false)       
                  }}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={editingRetrospective ? handleSaveEdit : handleAddRetrospective}
                disabled={!newRetrospective.feedback || !newRetrospective.responsible || !newRetrospective.owner}
              >
                {editingRetrospective ? "Save Changes" : "Add Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Management Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-3">{editingColumn ? "Edit Column" : "Add New Column"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Column Name</label>
                <input
                  type="text"
                  name="label"
                  value={newColumnData.label}
                  onChange={handleColumnInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Column name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Column Type</label>
                <select
                  name="type"
                  value={newColumnData.type}
                  onChange={handleColumnInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="type">Type</option>
                </select>
              </div>
              {editingColumn && (
                <div className="flex items-center">
                  <label className="text-sm font-medium mr-2">Visible</label>
                  <input
                    type="checkbox"
                    name="visible"
                    checked={newColumnData.visible !== false}
                    onChange={handleColumnInputChange}
                    className="rounded"
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between">
              {editingColumn && !["checkbox", "feedback", "votes"].includes(editingColumn.id) && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => {
                    handleDeleteColumn(editingColumn.id)
                    setShowColumnModal(false)
                  }}
                >
                  Delete Column
                </button>
              )}
              <div
                className={
                  editingColumn && !["checkbox", "feedback", "votes"].includes(editingColumn.id) ? "" : "ml-auto"
                }
              >
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-100 mr-2"
                  onClick={() => setShowColumnModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSaveColumn}
                  disabled={!newColumnData.label}
                >
                  {editingColumn ? "Save Changes" : "Add Column"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for the vote animation */}
      <style jsx global>{`
        @keyframes votePulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }
        @keyframes voteExplosion {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(2.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-vote-pulse {
          animation: votePulse 0.6s ease-in-out;
        }
        .animate-vote-explosion {
          animation: voteExplosion 0.8s ease-out;
        }
      `}</style>
    </div>
  )
)
}

export default RetrospectivesPage
