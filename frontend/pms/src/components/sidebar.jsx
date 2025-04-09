import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LogOut,
  Home,
  Sparkles,
  FolderKanban,
  Plus,
  Minus,
  ChevronDown,
  Search,
  Star,
  Clock,
  AlertCircle,
  Zap,
  X,
} from "lucide-react"

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchInput, setShowSearchInput] = useState(false)
  
  // Define the standard pages that each workspace should have - as a function
  // to prevent serialization issues
  const getStandardPages = () => [
    {
      id: 1,
      name: "PMS",
      iconType: "FolderKanban",
      path: "/taskdashboard",
    },
    {
      id: 2,
      name: "Sprints",
      iconType: "Zap",
      path: "/sprintspage",
    },
    {
      id: 3,
      name: "Bugs Queue",
      iconType: "AlertCircle",
      path: "/bugsqueue",
    },
    {
      id: 4,
      name: "Retrospectives",
      iconType: "Clock",
      path: "/retrospective",
    },
  ]

  // Function to render the correct icon based on type
  const renderIcon = (iconType) => {
    switch(iconType) {
      case "FolderKanban":
        return <FolderKanban className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />;
      case "Zap":
        return <Zap className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />;
      case "AlertCircle":
        return <AlertCircle className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" />;
      case "Clock":
        return <Clock className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />;
      default:
        return <FolderKanban className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />;
    }
  }

  // Default workspaces data
  const defaultWorkspaces = [
    {
      id: 1,
      name: "My Team",
      icon: "M",
      color: "blue",
      isActive: true,
      pages: getStandardPages(),
    },
  ]

  // Load state from localStorage or use defaults
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('expandedSections')
      return saved ? JSON.parse(saved) : {
        Favorites: false,
        Workspaces: false,
        "My Team": true,
      }
    } catch (error) {
      console.error("Error loading expandedSections from localStorage:", error)
      return {
        Favorites: false,
        Workspaces: false,
        "My Team": true,
      }
    }
  })

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('workspaces')
      return saved ? JSON.parse(saved) : defaultWorkspaces
    } catch (error) {
      console.error("Error loading workspaces from localStorage:", error)
      return defaultWorkspaces
    }
  })

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error)
      return []
    }
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('expandedSections', JSON.stringify(expandedSections))
    } catch (error) {
      console.error("Error saving expandedSections to localStorage:", error)
    }
  }, [expandedSections])

  useEffect(() => {
    try {
      localStorage.setItem('workspaces', JSON.stringify(workspaces))
    } catch (error) {
      console.error("Error saving workspaces to localStorage:", error)
    }
  }, [workspaces])

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error)
    }
  }, [favorites])

  // Track active workspace based on current path
  useEffect(() => {
    // Find which workspace contains the current path
    const currentPath = location.pathname
    
    // Only update active status if we're on a workspace page
    const isWorkspacePath = workspaces.some(workspace => 
      workspace.pages.some(page => page.path === currentPath)
    )
    
    if (isWorkspacePath) {
      const updatedWorkspaces = workspaces.map(workspace => ({
        ...workspace,
        isActive: workspace.pages.some(page => page.path === currentPath)
      }))
      
      setWorkspaces(updatedWorkspaces)
      
      // Auto-expand the active workspace
      workspaces.forEach(workspace => {
        if (workspace.pages.some(page => page.path === currentPath)) {
          setExpandedSections(prev => ({
            ...prev,
            [workspace.name]: true
          }))
        }
      })
    }
  }, [location.pathname])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }
    
    const query = searchQuery.toLowerCase()
    const results = []
    
    // Search through workspaces
    workspaces.forEach(workspace => {
      // Check workspace name
      if (workspace.name.toLowerCase().includes(query)) {
        results.push({
          type: 'workspace',
          id: workspace.id,
          name: workspace.name,
          workspace: workspace,
          icon: workspace.icon,
          color: workspace.color,
          path: workspace.pages?.[0]?.path || '/dashboard' // Default to first page or dashboard
        })
      }
      
      // Check workspace pages
      workspace.pages.forEach(page => {
        if (page.name.toLowerCase().includes(query)) {
          results.push({
            type: 'page',
            id: `${workspace.id}-${page.id}`,
            name: page.name,
            workspace: workspace,
            pageId: page.id,
            iconType: page.iconType,
            path: page.path,
            workspaceName: workspace.name
          })
        }
      })
    })
    
    setSearchResults(results)
  }, [searchQuery, workspaces])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleNavigation = (path) => {
    navigate(path)
    // Don't close dropdowns when navigating
  }

  const addWorkspace = () => {
    // Create confirmation
    if (window.confirm("Create a new workspace?")) {
      const newWorkspace = {
        id: Date.now(),
        name: `Workspace ${workspaces.length + 1}`,
        icon: `W${workspaces.length + 1}`,
        color: getRandomColor(),
        isActive: false,
        pages: getStandardPages(), // Call the function to get fresh pages
      }
      
      setWorkspaces([...workspaces, newWorkspace])

      // Automatically expand the new workspace
      setExpandedSections(prev => ({
        ...prev,
        [newWorkspace.name]: true,
      }))
      
      // Show success message
      alert(`Workspace "${newWorkspace.name}" created successfully`)
    }
  }

  const deleteWorkspace = (id, name, e) => {
    e.stopPropagation()
    
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      // Remove from favorites if it exists there
      setFavorites(favorites.filter(fav => fav.id !== id))
      
      // Remove from workspaces
      setWorkspaces(workspaces.filter(workspace => workspace.id !== id))
      
      // Show success message
      alert(`Workspace "${name}" deleted successfully`)
    }
  }

  const toggleFavorite = (workspace, e) => {
    e.stopPropagation()
    const isFavorite = favorites.some(fav => fav.id === workspace.id)

    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.id !== workspace.id))
    } else {
      setFavorites([...favorites, workspace])
      // Show confirmation
      alert(`Added "${workspace.name}" to favorites`)
    }
  }

  const getRandomColor = () => {
    const colors = ["blue", "purple", "green", "red", "orange", "pink"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-600",
      purple: "bg-purple-600",
      green: "bg-green-600",
      red: "bg-red-600",
      orange: "bg-orange-600",
      pink: "bg-pink-600",
    }
    return colorMap[color] || "bg-gray-600"
  }

  const getTextColorClass = (color) => {
    const colorMap = {
      blue: "text-blue-900",
      purple: "text-purple-900",
      green: "text-green-900",
      red: "text-red-900",
      orange: "text-orange-900",
      pink: "text-pink-900",
    }
    return colorMap[color] || "text-gray-900"
  }

  const getBgColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-50 border-blue-500",
      purple: "bg-purple-50 border-purple-500",
      green: "bg-green-50 border-green-500",
      red: "bg-red-50 border-red-500",
      orange: "bg-orange-50 border-orange-500",
      pink: "bg-pink-50 border-pink-500",
    }
    return colorMap[color] || "bg-gray-50 border-gray-500"
  }

  const isFavorite = (id) => {
    return favorites.some(fav => fav.id === id)
  }

  // Set active workspace
  const setActiveWorkspace = (activeId) => {
    setWorkspaces(
      workspaces.map(w => ({
        ...w,
        isActive: w.id === activeId,
      }))
    )
  }

  // Handle search result click
  const handleSearchResultClick = (result) => {
    // Navigate to the page
    handleNavigation(result.path)
    
    // If it's a workspace page, set the workspace as active
    if (result.type === 'page' && result.workspace) {
      setActiveWorkspace(result.workspace.id)
      
      // Expand the workspace section
      setExpandedSections(prev => ({
        ...prev,
        [result.workspace.name]: true
      }))
    } else if (result.type === 'workspace') {
      setActiveWorkspace(result.id)
    }
    
    // Close the search
    closeSearch()
  }

  // Toggle search mode
  const toggleSearch = (e) => {
    e.stopPropagation()
    setShowSearchInput(!showSearchInput)
    if (!showSearchInput) {
      setSearchQuery("")
      setSearchResults([])
    }
  }

  // Close search
  const closeSearch = () => {
    setShowSearchInput(false)
    setSearchQuery("")
    setSearchResults([])
  }

  // Render workspace pages with proper state handling
  const renderWorkspacePages = (workspace) => {
    return (
      <div className="pl-8 pr-4 py-2 bg-gray-50 space-y-2">
        {workspace.pages.map(page => (
          <div
            key={page.id}
            className={`flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group ${location.pathname === page.path ? "bg-white text-blue-600 font-semibold" : ""}`}
            onClick={(e) => {
              e.stopPropagation() // Prevent closing the dropdown
              handleNavigation(page.path)
              setActiveWorkspace(workspace.id) // Set this workspace as active when navigating to its page
            }}
          >
            {renderIcon(page.iconType)}
            <span className="font-medium">{page.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 space-y-1">
        <div
          className={`flex items-center p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group ${location.pathname === "/dashboard" ? "bg-gray-100 text-blue-600" : ""}`}
          onClick={() => handleNavigation("/dashboard")}
        >
          <Home className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
          <span className="font-medium group-hover:text-blue-600 transition-colors">Home</span>
        </div>
        <div
          className={`flex items-center p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer group ${location.pathname === "/tools" ? "bg-gray-100 text-blue-600" : ""}`}
          onClick={() => handleNavigation("/tools")}
        >
          <Sparkles className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
          <span className="font-medium group-hover:text-blue-600 transition-colors">Tools</span>
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto">
        {/* Favorites Section */}
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            toggleSection("Favorites")
          }}
        >
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-3 text-yellow-500" />
            <span className="font-medium">Favorites</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSections["Favorites"] ? "rotate-180" : ""}`}
          />
        </div>

        {expandedSections["Favorites"] && (
          <div className="pl-4 pr-4 py-2 bg-gray-50 space-y-2">
            {favorites.length > 0 ? (
              favorites.map(workspace => (
                <div key={workspace.id}>
                  <div
                    className={`flex items-center justify-between py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group ${workspace.isActive ? "bg-white text-blue-600" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Set this workspace as active
                      setActiveWorkspace(workspace.id)
                      toggleSection(workspace.name)
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 ${getColorClass(workspace.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-2 shadow-sm`}
                      >
                        {workspace.icon}
                      </div>
                      <span className="font-medium">{workspace.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className={`p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors duration-200`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSection(workspace.name)
                        }}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transform transition-transform duration-200 ${expandedSections[workspace.name] ? "rotate-180" : ""}`}
                        />
                      </button>
                      <Star
                        className="w-4 h-4 text-yellow-500 hover:text-yellow-600"
                        fill="currentColor"
                        onClick={(e) => toggleFavorite(workspace, e)}
                      />
                    </div>
                  </div>

                  {/* Show workspace pages when expanded */}
                  {expandedSections[workspace.name] && renderWorkspacePages(workspace)}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic py-2">No favorites yet</div>
            )}
          </div>
        )}

        {/* Workspaces Section */}
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            if (!showSearchInput) {
              toggleSection("Workspaces")
            }
          }}
        >
          <div className="flex items-center">
            <FolderKanban className="w-5 h-5 mr-3 text-purple-500" />
            <span className="font-medium">Workspaces</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation()
                addWorkspace()
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              className={`p-1 ${showSearchInput ? "text-blue-500" : "text-gray-500"} hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200`}
              onClick={toggleSearch}
            >
              <Search className="w-4 h-4" />
            </button>
            <ChevronDown
              className={`w-4 h-4 transform transition-transform duration-200 ${expandedSections["Workspaces"] ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Inline Search Input */}
        {showSearchInput && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center rounded-md bg-white border border-gray-300 px-2 py-1">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                className="flex-1 border-none outline-none text-sm"
                placeholder="Search workspaces and pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-md border border-gray-200 shadow-sm max-h-64 overflow-y-auto">
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.type === 'workspace' ? (
                      <>
                        <div className={`w-5 h-5 ${getColorClass(result.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-3`}>
                          {result.icon}
                        </div>
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-xs text-gray-500">Workspace</div>
                        </div>
                      </>
                    ) : (
                      <>
                        {renderIcon(result.iconType)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-xs text-gray-500">Page in {result.workspaceName}</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.trim() !== "" && searchResults.length === 0 && (
              <div className="mt-2 text-center text-gray-500 py-2 bg-white rounded-md border border-gray-200">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {expandedSections["Workspaces"] && (
          <div className="pl-4 pr-4 py-2 bg-gray-50 space-y-2">
            {workspaces.map(workspace => (
              <div key={workspace.id}>
                <div
                  className={`flex items-center justify-between p-3 rounded-md ${workspace.isActive ? `${getBgColorClass(workspace.color)} border-l-4` : "hover:bg-gray-100"} transition-all duration-200 cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveWorkspace(workspace.id)
                    
                    // Navigate to first page of workspace when clicking on workspace
                    if (workspace.pages && workspace.pages.length > 0) {
                      handleNavigation(workspace.pages[0].path)
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 ${getColorClass(workspace.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-3 shadow-sm`}
                    >
                      {workspace.icon}
                    </div>
                    <span
                      className={`font-medium ${workspace.isActive ? getTextColorClass(workspace.color) : "text-gray-700"}`}
                    >
                      {workspace.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-1 text-gray-500 hover:bg-gray-200 rounded transition-colors duration-200`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSection(workspace.name)
                      }}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform duration-200 ${expandedSections[workspace.name] ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      className={`p-1 ${isFavorite(workspace.id) ? "text-yellow-500" : "text-gray-400"} hover:text-yellow-600 hover:bg-gray-200 rounded transition-colors duration-200`}
                      onClick={(e) => toggleFavorite(workspace, e)}
                    >
                      <Star className="w-4 h-4" fill={isFavorite(workspace.id) ? "currentColor" : "none"} />
                    </button>
                    {workspace.name !== "My Team" && (
                      <button
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-200 rounded transition-colors duration-200"
                        onClick={(e) => deleteWorkspace(workspace.id, workspace.name, e)}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Workspace content - show when expanded */}
                {expandedSections[workspace.name] && renderWorkspacePages(workspace)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              handleNavigation("/Login")
            }
          }}
          className="w-full flex items-center justify-center gap-2 rounded-lg shadow-sm bg-blue-500 text-white py-2 px-4 hover:bg-red-600 transition font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar