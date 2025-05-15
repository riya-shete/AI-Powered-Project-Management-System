"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  User,
  Filter,
  ArrowDownUp,
  EyeOff,
  MoreVertical,
  Plus,
  Edit,
  Check,
  X,
  Trash2,
  Settings,
} from "lucide-react"

import Navbar from "../components/navbar"
import Sidebar from "../components/sidebar"

const SprintsPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Sprintmain />
      </div>
    </div>
  )
}

const Sprintmain = () => {
  // Load data from localStorage if available
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("sprintTasks")
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: "13455134",
            name: "Sprint 1",
            responsible: "Vivek S.",
            role: "Dev",
            status: "In Progress",
            priority: "High",
            added: "29 Dec 2024",
            active: true,
          },
          {
            id: "12451545",
            name: "Sprint 2",
            responsible: "Shriraj P.",
            role: "Design",
            status: "Waiting for review",
            priority: "Low",
            added: "24 Dec 2024",
            active: false,
          },
          {
            id: "3246151",
            name: "Sprint 3",
            responsible: "Anand S.",
            role: "Product",
            status: "Stuck",
            priority: "Medium",
            added: "12 Dec 2024",
            active: true,
          },
          {
            id: "64135315",
            name: "Sprint 4",
            responsible: "Riya S.",
            role: "Dev",
            status: "Done",
            priority: "Low",
            added: "21 Oct 2024",
            active: false,
          },
          {
            id: "1464135",
            name: "Sprint 5",
            responsible: "Kalyani B.",
            role: "Product",
            status: "Ready to start",
            priority: "Low",
            added: "21 Oct 2024",
            active: true,
          },
        ]
  })

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sprintTasks", JSON.stringify(tasks))
  }, [tasks])

  // Load columns from localStorage if available
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem("sprintColumns")
    return savedColumns
      ? JSON.parse(savedColumns)
      : [
          { id: "checkbox", label: "", type: "checkbox", visible: true, width: "40px", order: 0 },
          { id: "name", label: "Tasks", type: "text", visible: true, width: "200px", order: 1 },
          { id: "responsible", label: "Responsible", type: "text", visible: true, width: "150px", order: 2 },
          { id: "role", label: "Role", type: "text", visible: true, width: "120px", order: 3 },
          { id: "status", label: "Status", type: "text", visible: true, width: "150px", order: 4 },
          { id: "priority", label: "Priority", type: "priority", visible: true, width: "120px", order: 5 },
          { id: "added", label: "Added", type: "date", visible: true, width: "120px", order: 6 },
          { id: "active", label: "Active?", type: "boolean", visible: true, width: "80px", order: 7 },
        ]
  })

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sprintColumns", JSON.stringify(columns))
  }, [columns])

  const [newTask, setNewTask] = useState({
    name: "",
    responsible: "",
    role: "",
    status: "",
    priority: "Low",
    active: false,
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [personFilter, setPersonFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [showColumnModal, setShowColumnModal] = useState(false)
  const [newColumnData, setNewColumnData] = useState({ label: "", type: "text" })
  const [editingColumn, setEditingColumn] = useState(null)
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const [columnBeingModified, setColumnBeingModified] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  // Add a new state variable to track the selected column
  const [selectedColumn, setSelectedColumn] = useState(null)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-orange-100 text-orange-700"
      case "Medium":
        return "bg-gray-100 text-gray-700"
      case "Low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTask = () => {
    // Generate a random ID for the new task
    const newId = Math.floor(Math.random() * 10000000).toString()

    // Get current date in DD MMM YYYY format
    const today = new Date()
    const options = { day: "2-digit", month: "short", year: "numeric" }
    const formattedDate = today.toLocaleDateString("en-GB", options).replace(/ /g, " ")

    const taskToAdd = {
      ...newTask,
      id: newId,
      added: formattedDate,
    }

    setTasks((prev) => [taskToAdd, ...prev])
    setNewTask({
      name: "",
      responsible: "",
      role: "",
      status: "",
      priority: "Low",
      active: false,
    })
    setShowAddForm(false)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask({
      name: task.name,
      responsible: task.responsible,
      role: task.role,
      status: task.status,
      priority: task.priority,
      active: task.active,
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = () => {
    setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? { ...task, ...newTask } : task)))
    setNewTask({
      name: "",
      responsible: "",
      role: "",
      status: "",
      priority: "Low",
      active: false,
    })
    setEditingTask(null)
    setShowAddForm(false)
  }

  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedTasks(tasks.map((task) => task.id))
    } else {
      setSelectedTasks([])
    }
  }

  const handleTaskSelect = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId))
    } else {
      setSelectedTasks((prev) => [...prev, taskId])
    }
  }

  // Delete selected tasks
  const handleDeleteSelected = () => {
    if (selectedTasks.length === 0) return

    setTasks((prev) => prev.filter((task) => !selectedTasks.includes(task.id)))
    setSelectedTasks([])
    setSelectAll(false)
  }

  // Delete a single task
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    setSelectedTasks((prev) => prev.filter((id) => id !== taskId))
  }

  // Toggle task active status
  const handleToggleActive = (taskId) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, active: !task.active } : task)))
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

      // Add this field to all existing tasks
      setTasks((prev) => prev.map((task) => ({ ...task, [newId]: "" })))
    }

    setShowColumnModal(false)
  }

  const handleDeleteColumn = (columnId) => {
    // Don't allow deleting essential columns
    if (["checkbox", "name"].includes(columnId)) return

    setColumns((prev) => prev.filter((col) => col.id !== columnId))

    // Remove this field from all tasks
    setTasks((prev) =>
      prev.map((task) => {
        const newTask = { ...task }
        delete newTask[columnId]
        return newTask
      }),
    )
  }

  const handleToggleColumnVisibility = (columnId) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)))
  }

  // Column resizing
  const handleResizeStart = (e, columnId) => {
    e.preventDefault()
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
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

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

  // Cell editing
  const [editingCell, setEditingCell] = useState(null)
  const [cellValue, setCellValue] = useState("")

  const handleCellClick = (taskId, columnId, value) => {
    // Don't allow editing checkbox or active columns directly
    if (["checkbox", "active"].includes(columnId)) return

    setEditingCell({ taskId, columnId })
    setCellValue(value !== undefined ? value : "")
  }

  const handleCellChange = (e) => {
    setCellValue(e.target.value)
  }

  const handleCellBlur = () => {
    if (!editingCell) return

    const { taskId, columnId } = editingCell

    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, [columnId]: cellValue } : task)))

    setEditingCell(null)
  }

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCellBlur()
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

  // Get unique persons and roles for dropdowns
  const uniquePersons = [...new Set(tasks.map((task) => task.responsible))]
  const uniqueRoles = [...new Set(tasks.map((task) => task.role))]

  // Filtered tasks based on search query and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = searchQuery
        ? task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.responsible.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesPerson = personFilter ? task.responsible === personFilter : true

      const matchesRole = roleFilter ? task.role === roleFilter : true

      return matchesSearch && matchesPerson && matchesRole
    })
  }, [tasks, searchQuery, personFilter, roleFilter])

  // Sort columns by order
  const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => a.order - b.order)
  }, [columns])

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

  return (
    <div className="flex-1 overflow-auto w-full h-full">
      <div className="p-4 bg-white">
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Projects / Ronin's Project</div>
            <h1 className="text-2xl text-gray-700 font-bold">Sprints</h1>
          </div>
        </header>

        <div className="flex items-center mb-4">
          <div className="font-medium">Main Table</div>
          <div className="relative ml-2">
            <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}>
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
          <button className="ml-4" onClick={handleAddColumn}>
            <Plus size={16} />
          </button>
        </div>

        <div className="flex mb-4 space-x-2 flex-wrap">
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded flex items-center"
            onClick={() => {
              setEditingTask(null)
              setNewTask({
                name: "",
                responsible: "",
                role: "",
                status: "",
                priority: "Low",
                active: false,
              })
              setShowAddForm(true)
            }}
          >
            New Sprint <Plus size={14} className="ml-1" />
          </button>

          {selectedTasks.length > 0 && (
            <button
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded flex items-center"
              onClick={handleDeleteSelected}
            >
              Delete Selected <Trash2 size={14} className="ml-1" />
            </button>
          )}

          <div className="relative">
            <input
              type="text"
              placeholder="Search sprints"
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
                setIsRoleDropdownOpen(false)
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
                setIsRoleDropdownOpen(!isRoleDropdownOpen)
                setIsPersonDropdownOpen(false)
              }}
            >
              <Filter size={14} className="mr-1" />
              {roleFilter || "Role"}
            </button>
            {isRoleDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg">
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setRoleFilter("")
                    setIsRoleDropdownOpen(false)
                  }}
                >
                  All Roles
                </div>
                {uniqueRoles.map((role) => (
                  <div
                    key={role}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRoleFilter(role)
                      setIsRoleDropdownOpen(false)
                    }}
                  >
                    {role}
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
                  .map((column, index) => (
                    <th
                      key={column.id}
                      className={`p-3 text-sm font-medium text-gray-600 relative ${
                        selectedColumn === column.id ? "bg-blue-50" : ""
                      }`}
                      style={{ width: column.width }}
                      draggable={column.id !== "checkbox"}
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
                                {column.id !== "name" && (
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
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleResizeStart(e, column.id)
                        }}
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
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-gray-50">
                  {sortedColumns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <td key={`${task.id}-${column.id}`} className="p-3">
                        {column.id === "checkbox" ? (
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleTaskSelect(task.id)}
                          />
                        ) : column.id === "name" ? (
                          <div className="flex items-center">
                            {editingCell && editingCell.taskId === task.id && editingCell.columnId === "name" ? (
                              <input
                                type="text"
                                value={cellValue}
                                onChange={handleCellChange}
                                onBlur={handleCellBlur}
                                onKeyDown={handleCellKeyDown}
                                className="border p-1 rounded w-full"
                                autoFocus
                              />
                            ) : (
                              <>
                                <span
                                  className="cursor-pointer"
                                  onClick={() => handleCellClick(task.id, "name", task.name)}
                                >
                                  {task.name}
                                </span>
                                <div className="ml-auto flex items-center">
                                  <button
                                    className="ml-2 text-gray-500 hover:text-blue-600"
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="ml-2 text-gray-500 hover:text-red-600"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : column.id === "responsible" ? (
                          editingCell && editingCell.taskId === task.id && editingCell.columnId === "responsible" ? (
                            <input
                              type="text"
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              onKeyDown={handleCellKeyDown}
                              className="border p-1 rounded w-full"
                              autoFocus
                            />
                          ) : (
                            <a
                              href="#"
                              className="text-blue-600"
                              onClick={(e) => {
                                e.preventDefault()
                                handleCellClick(task.id, "responsible", task.responsible)
                              }}
                            >
                              {task.responsible}
                            </a>
                          )
                        ) : column.id === "priority" ? (
                          editingCell && editingCell.taskId === task.id && editingCell.columnId === "priority" ? (
                            <select
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              className="border p-1 rounded w-full"
                              autoFocus
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                                task.priority,
                              )} cursor-pointer`}
                              onClick={() => handleCellClick(task.id, "priority", task.priority)}
                            >
                              {task.priority}
                            </span>
                          )
                        ) : column.id === "role" ? (
                          editingCell && editingCell.taskId === task.id && editingCell.columnId === "role" ? (
                            <select
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              className="border p-1 rounded w-full"
                              autoFocus
                            >
                              <option value="Dev">Dev</option>
                              <option value="Design">Design</option>
                              <option value="Product">Product</option>
                            </select>
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() => handleCellClick(task.id, "role", task.role)}
                            >
                              {task.role}
                            </span>
                          )
                        ) : column.id === "status" ? (
                          editingCell && editingCell.taskId === task.id && editingCell.columnId === "status" ? (
                            <select
                              value={cellValue}
                              onChange={handleCellChange}
                              onBlur={handleCellBlur}
                              className="border p-1 rounded w-full"
                              autoFocus
                            >
                              <option value="In Progress">In Progress</option>
                              <option value="Waiting for review">Waiting for review</option>
                              <option value="Stuck">Stuck</option>
                              <option value="Done">Done</option>
                              <option value="Ready to start">Ready to start</option>
                            </select>
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() => handleCellClick(task.id, "status", task.status)}
                            >
                              {task.status}
                            </span>
                          )
                        ) : column.id === "active" ? (
                          <button onClick={() => handleToggleActive(task.id)} className="focus:outline-none">
                            {task.active ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <X size={16} className="text-red-500" />
                            )}
                          </button>
                        ) : column.id === "added" ? (
                          <span>{task.added}</span>
                        ) : editingCell && editingCell.taskId === task.id && editingCell.columnId === column.id ? (
                          <input
                            type="text"
                            value={cellValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleCellKeyDown}
                            className="border p-1 rounded w-full"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() => handleCellClick(task.id, column.id, task[column.id])}
                          >
                            {task[column.id] || ""}
                          </span>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal popup for adding/editing tasks */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-3">{editingTask ? "Edit Sprint" : "Add New Sprint"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sprint Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Sprint name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsible</label>
                <input
                  type="text"
                  name="responsible"
                  value={newTask.responsible}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={newTask.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Role</option>
                  <option value="Dev">Dev</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for review">Waiting for review</option>
                  <option value="Stuck">Stuck</option>
                  <option value="Done">Done</option>
                  <option value="Ready to start">Ready to start</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Active</label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    name="active"
                    checked={newTask.active}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, active: e.target.checked }))}
                    className="rounded"
                  />
                </div>
              </div>

              {/* Custom fields */}
              {columns
                .filter(
                  (col) =>
                    !["checkbox", "name", "responsible", "role", "status", "priority", "added", "active"].includes(
                      col.id,
                    ),
                )
                .map((column) => (
                  <div key={column.id}>
                    <label className="block text-sm font-medium mb-1">{column.label}</label>
                    <input
                      type="text"
                      name={column.id}
                      value={newTask[column.id] || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      placeholder={column.label}
                    />
                  </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 border rounded hover:bg-gray-100" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={editingTask ? handleSaveEdit : handleAddTask}
                disabled={!newTask.name || !newTask.responsible || !newTask.role || !newTask.status}
              >
                {editingTask ? "Save Changes" : "Add Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal popup for adding/editing columns */}
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
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                  <option value="priority">Priority</option>
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
              {editingColumn && !["checkbox", "name"].includes(editingColumn.id) && (
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
              <div className={editingColumn && !["checkbox", "name"].includes(editingColumn.id) ? "" : "ml-auto"}>
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
    </div>
  )
}

export default SprintsPage
