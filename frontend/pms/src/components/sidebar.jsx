"use client"
// ADD: Import axios at the top of your file
import axios from 'axios'
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LogOut,
  Home,
  Sparkles,
  FolderKanban,
  Plus,
  ChevronDown,
  Search,
  Clock,
  AlertCircle,
  Zap,
  X,
  Pencil,
  Settings,
  Trash2,
  Pin,
} from "lucide-react"

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // API base URL 
  const BASE_URL = "http://localhost:8000" 

  // ADD: Project state management
  const [currentProjectId, setCurrentProjectId] = useState(
    localStorage.getItem('currentProjectId') || '1'
  )

//state variables
const [projects, setProjects] = useState([])
// const [workspacesFromAPI, setWorkspacesFromAPI] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

//Project dialog states
const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)
const [isRenameProjectDialogOpen, setIsRenameProjectDialogOpen] = useState(false)
const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false)
const [activeProject, setActiveProject] = useState(null)
const [newProjectName, setNewProjectName] = useState("")
const [activeWorkspaceForProject, setActiveWorkspaceForProject] = useState(null);

//Search state
const [searchQuery, setSearchQuery] = useState("")
const [searchResults, setSearchResults] = useState([])
const [showSearchInput, setShowSearchInput] = useState(false)

  // Workspace management state
  const [activeWorkspaceMenu, setActiveWorkspaceMenu] = useState(null)


//Project expansion state
const [expandedProjects, setExpandedProjects] = useState(() => {
  try {
    const saved = localStorage.getItem("expandedProjects")
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error("Error loading expandedProjects from localStorage:", error)
    return {}
  }
})

//Save expanded projects to localStorage
useEffect(() => {
  try {
    localStorage.setItem("expandedProjects", JSON.stringify(expandedProjects))
  } catch (error) {
    console.error("Error saving expandedProjects to localStorage:", error)
  }
}, [expandedProjects])

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogAction, setDialogAction] = useState("")

const getWorkspaceIcon = (workspace) => { 
  // return workspace.icon || workspace.name.charAt(0).toUpperCase(); 
  return 'W';
}

  const token = localStorage.getItem("token");
  console.log("Token used for fetching projects:", token);

  //Workspace CRUD API functions
  const workspaceAPI = {
    // GET All Workspaces
    getAllWorkspaces: async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/workspaces/", {
          headers: {
            'Authorization': `Token ${token}`, 
          }
        })
        console.log("fetched workspaces:",response.data)
        return response.data
        
      } catch (error) {
        console.error('Error fetching workspaces:', error)
        throw error
      }
    },

    // GET Workspace by ID
    getWorkspaceById: async (workspaceId) => {
      try {
        const response = await axios.get("http://localhost:8000/api/workspaces/", {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Object-ID': workspaceId
          }
        })
        return response.data
      } catch (error) {
        console.error('Error fetching workspace:', error)
        throw error
      }
    },

    // POST Create Workspace (updated)
  createWorkspace: async (workspaceData) => {
    try {
      const token = localStorage.getItem("token");
      const user_id = localStorage.getItem("user_id");
      
      const response = await axios.post(
        "http://localhost:8000/api/workspaces/", 
        {
          name: workspaceData.name,
          description: workspaceData.description || "New workspace",
          icon: "workspace_icon", // Default icon
          owner: parseInt(user_id) // Get owner from localStorage
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },
    // PUT Update Workspace
    updateWorkspace: async (workspaceId, workspaceData) => {
      try {
        const response = await axios.put("http://localhost:8000/api/workspaces/", workspaceData, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            'X-Object-ID': workspaceId
          }
        })
        return response.data
      } catch (error) {
        console.error('Error updating workspace:', error)
        throw error
      }
    },

    // DELETE Workspace
    deleteWorkspace: async (workspaceId) => {
      try {
        const response = await axios.delete("http://localhost:8000/api/workspaces/", {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Object-ID': workspaceId
          }
        })
        return response.data
      } catch (error) {
        console.error('Error deleting workspace:', error)
        throw error
      }
    }
  }

  //Project CRUD API functions
  const projectAPI = {
    // GET All Projects
    getAllProjects: async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/projects/", {
          headers: {
            'Authorization': `Token ${token}`,
          }
        })
        console.log("fetched projects", response.data)
        
        return response.data
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
      }
    },

    // GET Projects by Workspace
    getProjectsByWorkspace: async (workspaceId) => {
      try {
        const response = await axios.get("http://localhost:8000/api/projects/", {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Workspace-ID': workspaceId,
          }
        })
        return response.data
      } catch (error) {
        console.error('Error fetching projects by workspace:', error)
        throw error
      }
    },

    getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/projects/${projectId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
        }
      })
      
      const projectData = response.data
      
      // Stored projectId in localStorage for global access
      localStorage.setItem('currentProjectId', projectId)
      
      //stored full project data if needed
      localStorage.setItem('currentProject', JSON.stringify(projectData))
      
      return {
        ...projectData,
        projectId: projectId
      }
      
    } catch (error) {
      console.error('Error fetching project:', error)
      throw error
    }
  },
    // POST Create Project
    createProject: async (projectData, workspaceId) => {
      try {
        const response = await axios.post("http://localhost:8000/api/projects/", projectData, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            'X-Workspace-ID': workspaceId,
          }
        })
        return response.data
      } catch (error) {
        console.error('Error creating project:', error)
        throw error
      }
    },

    // PUT Update Project
    updateProject: async (projectId, projectData) => {
      try {
        const response = await axios.put("http://localhost:8000/api/projects/", projectData, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            'X-Object-ID': projectId
          }
        })
        return response.data
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      }
    },

    // DELETE Project
    deleteProject: async (projectId) => {
      try {
        const response = await axios.delete("http://localhost:8000/api/projects/", {
          headers: {
            'Authorization': `Token ${token}`,
            'X-Object-ID': projectId
          }
        })
        return response.data
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    }
  }

  //getStandardPages function:
  const getStandardPages = (projectId) => {
  // Using the passed projectId parameter, fallback to localStorage
  const actualProjectId = projectId || localStorage.getItem('currentProjectId') || '1'
  
  return [
    {
      id: 1,
      name: "PMS",
      iconType: "FolderKanban",
      path: `/project/${actualProjectId}/taskdashboard`,
    },
    {
      id: 2,
      name: "Sprints",
      iconType: "Zap",
      path: `/project/${actualProjectId}/sprintspage`,
    },
    {
      id: 3,
      name: "Bugs Queue",
      iconType: "AlertCircle",
      path: `/project/${actualProjectId}/bugsqueue`,
    },
    {
      id: 4,
      name: "Retrospectives",
      iconType: "Clock",
      path: `/project/${actualProjectId}/retrospective`,
    },
  ]
}

  // Function to render the correct icon based on type
  const renderIcon = (iconType) => {
    switch (iconType) {
      case "FolderKanban":
        return <FolderKanban className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />
      case "Zap":
        return <Zap className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />
      case "AlertCircle":
        return <AlertCircle className="w-4 h-4 mr-2 text-red-500 group-hover:text-red-600" />
      case "Clock":
        return <Clock className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />
      default:
        return <FolderKanban className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500" />
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
    pages: getStandardPages()
    
  },
]

  //Load state from localStorage or use defaults
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem("expandedSections")
      return saved
        ? JSON.parse(saved)
        : {
            Pinned: false,
            Workspaces: false,
            "My Team": true,
          }
    } catch (error) {
      console.error("Error loading expandedSections from localStorage:", error)
      return {
        Pinned: false,
        Workspaces: false,
        "My Team": true,
      }
    }
  })

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem("workspaces")
      return saved ? JSON.parse(saved) : defaultWorkspaces
    } catch (error) {
      console.error("Error loading workspaces from localStorage:", error)
      return defaultWorkspaces
    }
  })

  const [pinnedWorkspaces, setPinnedWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem("pinnedWorkspaces")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading pinnedWorkspaces from localStorage:", error)
      return []
    }
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("expandedSections", JSON.stringify(expandedSections))
    } catch (error) {
      console.error("Error saving expandedSections to localStorage:", error)
    }
  }, [expandedSections])

  useEffect(() => {
    try {
      localStorage.setItem("workspaces", JSON.stringify(workspaces))
    } catch (error) {
      console.error("Error saving workspaces to localStorage:", error)
    }
  }, [workspaces])

  useEffect(() => {
    try {
      localStorage.setItem("pinnedWorkspaces", JSON.stringify(pinnedWorkspaces))
    } catch (error) {
      console.error("Error saving pinnedWorkspaces to localStorage:", error)
    }
  }, [pinnedWorkspaces])

  // Track active workspace based on current path
  useEffect(() => {
    // Finding which workspace contains the current path
    const currentPath = location.pathname

    // update only active status if we're on a workspace page
    const isWorkspacePath = workspaces.some((workspace) =>
      (workspace.pages || []).some((page) => page.path === currentPath)
    );

    if (isWorkspacePath) {
      const updatedWorkspaces = workspaces.map((workspace) => ({
        ...workspace,
        isActive: (workspace.pages || []).some((page) => page.path === currentPath),
      }));

      setWorkspaces(updatedWorkspaces)

      // Auto-expand the active workspace
      workspaces.forEach((workspace) => {
        if (workspace.pages.some((page) => page.path === currentPath)) {
          setExpandedSections((prev) => ({
            ...prev,
            [workspace.name]: true,
          }))
        }
      })
    }
  }, [location.pathname])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = []

    // Search through workspaces
    workspaces.forEach((workspace) => {
      // Check workspace name
      if (workspace.name.toLowerCase().includes(query)) {
        results.push({
          type: "workspace",
          id: workspace.id,
          name: workspace.name,
          workspace: workspace,
          icon: workspace.icon,
          color: workspace.color,
          path: workspace.pages?.[0]?.path || "/dashboard", // Default to first page or dashboard
        })
      }

      // Check workspace pages
      workspace.pages.forEach((page) => {
        if (page.name.toLowerCase().includes(query)) {
          results.push({
            type: "page",
            id: `${workspace.id}-${page.id}`,
            name: page.name,
            workspace: workspace,
            pageId: page.id,
            iconType: page.iconType,
            path: page.path,
            workspaceName: workspace.name,
          })
        }
      })
    })

    setSearchResults(results)
  }, [searchQuery, workspaces])

  // Closing workspace menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside any workspace menu
      if (activeWorkspaceMenu !== null && !event.target.closest(".workspace-menu-container")) {
        setActiveWorkspaceMenu(null)
      }

      // Close dialogs when clicking outside
      if (
        (isCreateDialogOpen || isRenameDialogOpen || isDeleteDialogOpen) &&
        event.target.classList.contains("dialog-overlay")
      ) {
        setIsCreateDialogOpen(false)
        setIsRenameDialogOpen(false)
        setIsDeleteDialogOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [activeWorkspaceMenu, isCreateDialogOpen, isRenameDialogOpen, isDeleteDialogOpen])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }
  //Toggle down-up project expansion
const toggleProject = (projectId) => {
  setExpandedProjects((prev) => ({
    ...prev,
    [projectId]: !prev[projectId],
  }))
}
  const handleNavigation = (path) => {
    navigate(path)
  }

// Updated addWorkspace function
const addWorkspace = async () => {
  if (newWorkspaceName.trim()) {
    setLoading(true);
    try {
      // CREATE via API with all required fields
      const newWorkspaceData = {
        name: newWorkspaceName,
        description: `${newWorkspaceName} workspace`,
      };
      
      const createdWorkspace = await workspaceAPI.createWorkspace(newWorkspaceData);
      
      //local state with API response
      const newWorkspace = {
        id: createdWorkspace.id,
        name: createdWorkspace.name,
        icon: createdWorkspace.name.charAt(0).toUpperCase(),
        color: getRandomColor(),
        isActive: false,
        pages: getStandardPages(currentProjectId),
      };

      setWorkspaces([...workspaces, newWorkspace]);
      
      // Auto-expand the new workspace
      setExpandedSections((prev) => ({
        ...prev,
        [newWorkspace.name]: true,
      }));

      // Reset and close dialog
      setNewWorkspaceName("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      setError('Failed to create workspace');
      console.error('Create workspace error:', error);
      // Show error to user
      alert(`Failed to create workspace: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }
};

//renameWorkspace function - not funtional right now
const renameWorkspace = async () => {
  if (newWorkspaceName && newWorkspaceName !== activeWorkspace.name) {
    setLoading(true)
    try {
      // UPDATE via API
      await workspaceAPI.updateWorkspace(activeWorkspace.id, {
        name: newWorkspaceName,
      })

      // Update local state
      const updatedWorkspaces = workspaces.map((w) =>
        w.id === activeWorkspace.id ? { ...w, name: newWorkspaceName } : w,
      )
      setWorkspaces(updatedWorkspaces)

      // Update expanded sections with new name
      const newExpandedSections = { ...expandedSections }
      if (expandedSections[activeWorkspace.name] !== undefined) {
        newExpandedSections[newWorkspaceName] = expandedSections[activeWorkspace.name]
        delete newExpandedSections[activeWorkspace.name]
        setExpandedSections(newExpandedSections)
      }

      // Update pinned workspaces if needed
      const pinnedIndex = pinnedWorkspaces.findIndex((p) => p.id === activeWorkspace.id)
      if (pinnedIndex !== -1) {
        const newPinnedWorkspaces = [...pinnedWorkspaces]
        newPinnedWorkspaces[pinnedIndex] = { ...newPinnedWorkspaces[pinnedIndex], name: newWorkspaceName }
        setPinnedWorkspaces(newPinnedWorkspaces)
      }
    } catch (error) {
      setError('Failed to rename workspace')
      console.error('Rename workspace error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset and close dialog
  setNewWorkspaceName("")
  setIsRenameDialogOpen(false)
  setActiveWorkspace(null)
}

//deleteWorkspace function
const deleteWorkspace = async () => {
  setLoading(true)
  try {
    // DELETE via API
    await workspaceAPI.deleteWorkspace(activeWorkspace.id)

    // Remove from pinned if it exists there
    setPinnedWorkspaces(pinnedWorkspaces.filter((pinned) => pinned.id !== activeWorkspace.id))

    // Remove from workspaces
    setWorkspaces(workspaces.filter((workspace) => workspace.id !== activeWorkspace.id))

    // Close dialog
    setIsDeleteDialogOpen(false)
    setActiveWorkspace(null)
  } catch (error) {
    setError('Failed to delete workspace')
    console.error('Delete workspace error:', error)
  } finally {
    setLoading(false)
  }
}

//Project management functions
const addProject = async () => {
  if (newProjectName.trim() && activeWorkspaceForProject) {
    setLoading(true);
    try {
      const projectData = {
        name: newProjectName,
        key: `pjt_${Math.random().toString(36).substring(2, 6)}`, // Generate random key
        description: `${newProjectName} project`,
        icon: "project_icon",
        workspace: activeWorkspaceForProject.id
      };
      const createdProject = await projectAPI.createProject(projectData, activeWorkspaceForProject.id);
      
      // Update projects state
      setProjects([...projects, {
        ...createdProject,
        workspaceId: activeWorkspaceForProject.id
      }]);

      setNewProjectName("");
      setIsCreateProjectDialogOpen(false);
    } catch (error) {
      setError('Failed to create project');
      console.error('Create project error:', error);
    } finally {
      setLoading(false);
    }
  }
};

//rename project - not working rn
const renameProject = async () => {
  if (newProjectName && newProjectName !== activeProject.name) {
    setLoading(true)
    try {
      await projectAPI.updateProject(activeProject.id, {
        name: newProjectName,
      })

      // Update local state
      setProjects(projects.map(p => 
        p.id === activeProject.id ? { ...p, name: newProjectName } : p
      ))
      
      setNewProjectName("")
      setIsRenameProjectDialogOpen(false)
      setActiveProject(null)
    } catch (error) {
      setError('Failed to rename project')
      console.error('Rename project error:', error)
    } finally {
      setLoading(false)
    }
  }
}

const deleteProject = async () => {
  setLoading(true)
  try {
    await projectAPI.deleteProject(activeProject.id)
    
    setProjects(projects.filter(p => p.id !== activeProject.id))
    
    setIsDeleteProjectDialogOpen(false)
    setActiveProject(null)
  } catch (error) {
    setError('Failed to delete project')
    console.error('Delete project error:', error)
  } finally {
    setLoading(false)
  }
}
// ADD: Project dialog handlers
const openCreateProjectDialog = (workspace) => {
  setActiveWorkspaceForProject(workspace)
  setNewProjectName("")
  setIsCreateProjectDialogOpen(true)
}

const openRenameProjectDialog = (project) => {
  setActiveProject(project)
  setNewProjectName(project.name)
  setIsRenameProjectDialogOpen(true)
}

const openDeleteProjectDialog = (project) => {
  setActiveProject(project)
  setIsDeleteProjectDialogOpen(true)
}
//Loading data on component mount
useEffect(() => {
  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load workspaces and projects from API
      const [workspacesData, projectsData] = await Promise.all([
        workspaceAPI.getAllWorkspaces(),
        projectAPI.getAllProjects()
      ])
      // Update the workspaces state with fetched data
      setWorkspaces(workspacesData.results)

      // setWorkspacesFromAPI(workspacesData)
      setProjects(projectsData)
    } catch (error) {
      setError('Failed to load data')
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  loadInitialData()
}, [])

  const togglePin = (workspace, e) => {
    e.stopPropagation()
    const isPinned = pinnedWorkspaces.some((pinned) => pinned.id === workspace.id)

    if (isPinned) {
      setPinnedWorkspaces(pinnedWorkspaces.filter((pinned) => pinned.id !== workspace.id))
    } else {
      setPinnedWorkspaces([...pinnedWorkspaces, workspace])
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

  const isPinned = (id) => {
    return pinnedWorkspaces.some((pinned) => pinned.id === id)
  }

  // Set active workspace for navigation
  const setActiveWorkspaceForNav = (activeId) => {
    setWorkspaces(
      workspaces.map((w) => ({
        ...w,
        isActive: w.id === activeId,
      })),
    )
  }

  // Handle search result click
  const handleSearchResultClick = (result) => {
    // Navigate to the page
    handleNavigation(result.path)

    // If it's a workspace page the workspace will be set as as active
    if (result.type === "page" && result.workspace) {
      setActiveWorkspaceForNav(result.workspace.id)

      // Expand the workspace section
      setExpandedSections((prev) => ({
        ...prev,
        [result.workspace.name]: true,
      }))
    } else if (result.type === "workspace") {
      setActiveWorkspaceForNav(result.id)
    }
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

  // Toggle workspace menu with section tracking
  const toggleWorkspaceMenu = (e, workspaceId, section) => {
    e.stopPropagation()
    const menuId = `${section}-${workspaceId}`
    setActiveWorkspaceMenu(activeWorkspaceMenu === menuId ? null : menuId)
  }

  // Handle key press in dialog
  const handleDialogKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isCreateDialogOpen) {
        addWorkspace()
      } else if (isRenameDialogOpen) {
        renameWorkspace()
      }
    } else if (e.key === "Escape") {
      setIsCreateDialogOpen(false)
      setIsRenameDialogOpen(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Open rename dialog
  const openRenameDialog = (workspace) => {
    setActiveWorkspace(workspace)
    setNewWorkspaceName(workspace.name)
    setDialogTitle("Rename Workspace")
    setDialogAction("Rename")
    setIsRenameDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (workspace) => {
    setActiveWorkspace(workspace)
    setDialogTitle("Delete Workspace")
    setDialogAction("Delete")
    setIsDeleteDialogOpen(true)
  }

// trying to_render workspace pages with proper state handling
  const renderWorkspacePages = (workspace) => {
    return (
      <div className="pl-8 pr-4 py-2 bg-gray-50 space-y-2">
        {workspace.pages.map((page) => (
          <div
            key={page.id}
            className={`flex items-center py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group ${location.pathname === page.path ? "bg-white text-blue-600 font-semibold" : ""}`}
            onClick={(e) => {
              e.stopPropagation() // Prevent closing the dropdown
              handleNavigation(page.path)
              setActiveWorkspaceForNav(workspace.id) // Set this workspace as active when navigating to its page
            }}
          >
            {renderIcon(page.iconType)}
            <span className="font-medium">{page.name}</span>
          </div>
        ))}
      </div>
    )
  }

  // Render workspace menu with section tracking
  const renderWorkspaceMenu = (workspace, section) => {
    const menuId = `${section}-${workspace.id}`
    if (activeWorkspaceMenu !== menuId) return null

    return (
      <div
        className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1 workspace-menu-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            openRenameDialog(workspace)
            setActiveWorkspaceMenu(null)
          }}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Rename
        </button>

        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            togglePin(workspace, e)
            setActiveWorkspaceMenu(null)
          }}
        >
          <Pin className="w-4 h-4 mr-2" />
          {isPinned(workspace.id) ? "Unpin" : "Pin"}
        </button>

        {workspace.name !== "My Team" && (
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              openDeleteDialog(workspace)
              setActiveWorkspaceMenu(null)
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        )}
      </div>
    )
  }
//reender project menu
const renderProjectMenu = (project, workspaceId) => {
  const menuId = `project-${project.id}`
  if (activeWorkspaceMenu !== menuId) return null

  return (
    <div
      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1 workspace-menu-container"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation()
          openRenameProjectDialog(project)
          setActiveWorkspaceMenu(null)
        }}
      >
        <Pencil className="w-4 h-4 mr-2" />
        Rename
      </button>

      <button
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation()
          openDeleteProjectDialog(project)
          setActiveWorkspaceMenu(null)
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </button>
    </div>
  )
}
// Enhanced dialog component with description field
const renderDialog = ({
  isOpen,
  title,
  action,
  showInput = true,
  onConfirm,
  confirmText,
  confirmClass = "bg-blue-600 hover:bg-blue-700",
}) => {
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dialog-overlay">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>

          {showInput && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={handleDialogKeyPress}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter workspace description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

          {!showInput && (
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete "{activeWorkspace?.name}"? This action cannot be undone.
              </p>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsRenameDialogOpen(false)
                setIsDeleteDialogOpen(false)
                setActiveWorkspace(null)
              }}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 ${confirmClass} border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              onClick={onConfirm}
            >
              {confirmText || action}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm max-w-full">
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
        {/* Pinned Section */}
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            toggleSection("Pinned")
          }}
        >
          <div className="flex items-center">
            <Pin className="w-5 h-5 mr-3 text-blue-500" />
            <span className="font-medium">Pinned</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedSections["Pinned"] ? "rotate-180" : ""}`}
          />
        </div>

        {expandedSections["Pinned"] && (
          <div className="pl-4 pr-4 py-2 bg-gray-50 space-y-2">
            {pinnedWorkspaces.length > 0 ? (
              pinnedWorkspaces.map((workspace) => (
                <div key={workspace.id}>
                  <div
                    className={`flex items-center justify-between py-2 px-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 cursor-pointer group ${workspace.isActive ? "bg-white text-blue-600" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Set this workspace as active
                      setActiveWorkspaceForNav(workspace.id)
                      toggleSection(workspace.name)
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 ${getColorClass(workspace.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-2 shadow-sm`}
                      >
                        {getWorkspaceIcon(workspace)}
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
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200 relative workspace-menu-container"
                        onClick={(e) => toggleWorkspaceMenu(e, workspace.id, "pinned")}
                      >
                        <Settings className="w-4 h-4" />
                        {renderWorkspaceMenu(workspace, "pinned")}
                      </button>
                    </div>
                  </div>

                  {/* Show workspace pages when expanded */}
                  {expandedSections[workspace.name] && renderWorkspacePages(workspace)}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic py-2">No pinned workspaces</div>
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
                setIsCreateDialogOpen(true)
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
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.type === "workspace" ? (
                      <>
                        <div
                          className={`w-5 h-5 ${getColorClass(result.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-3`}
                        >
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
    {workspaces.map((workspace) => (
      <div key={workspace.id} className="relative">
        <div
          className={`flex items-center justify-between p-3 rounded-md ${workspace.isActive ? `${getBgColorClass(workspace.color)} border-l-4` : "hover:bg-gray-100"} transition-all duration-200 cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation()
            toggleSection(workspace.name)
            
            localStorage.setItem('currentProjectId', workspace.id.toString())
            
            // Set active workspace
            setActiveWorkspaceForNav(workspace.id)
            const standardPages = getStandardPages()
            if (standardPages && standardPages.length > 0) {
              console.log('Navigating to:', standardPages[0].path)
              handleNavigation(standardPages[0].path)
            }
          }}
        >
          <div className="flex items-center">
            <div
              className={`w-6 h-6 ${getColorClass(workspace.color)} rounded-md flex items-center justify-center text-white font-medium text-xs mr-3 shadow-sm`}
            >
              {getWorkspaceIcon(workspace)}
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
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors duration-200 relative workspace-menu-container"
              onClick={(e) => toggleWorkspaceMenu(e, workspace.id, "workspace")}
            >
              <Settings className="w-4 h-4" />
              {renderWorkspaceMenu(workspace, "workspace")}
            </button>
            {/* New + icon for adding projects */}
            <button
              className="p-1 text-gray-400 hover:text-green-600 hover:bg-gray-200 rounded transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation()
                openCreateProjectDialog(workspace)
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        

        {/* Render projects under this workspace when expanded */}
        {expandedSections[workspace.name] && (
          <div className="ml-6 mt-2 space-y-1">
            {Array.isArray(projects.results) &&
              projects.results
                .filter(project => project.workspace === workspace.id)
              .map((project) => (
                <div key={project.id} className="relative">
                  <div
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-200 group"
                    onClick={(e) => {
                      e.stopPropagation()
                      localStorage.setItem('currentProjectId', project.id.toString())
                      setCurrentProjectId(project.id.toString())
                      toggleProject(project.id)
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center text-white font-medium text-xs mr-2">
                        P
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProject(project.id)
                        }}
                      >
                        <ChevronDown
                          className={`w-3 h-3 transform transition-transform duration-200 ${expandedProjects[project.id] ? "rotate-180" : ""}`}
                        />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200 relative workspace-menu-container"
                        onClick={(e) => toggleWorkspaceMenu(e, project.id, "project")}
                      >
                        <Settings className="w-3 h-3" />
                        {renderProjectMenu(project, workspace.id)}
                      </button>
                    </div>
                  </div>

                  {/* Render project pages when expanded */}
                  {expandedProjects[project.id] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getStandardPages(project.id).map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 group ${
                            location.pathname === page.path 
                              ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500" 
                              : "hover:bg-gray-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            localStorage.setItem('currentProjectId', project.id.toString())
                            setCurrentProjectId(project.id.toString())
                            handleNavigation(page.path)
                          }}
                        >
                          {renderIcon(page.iconType)}
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">
                            {page.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
            {Array.isArray(projects.results) && projects.results.filter(project => project.workspace === workspace.id).length === 0 && (
              <div className="ml-6 text-xs text-gray-500 italic py-2">
                No projects in this workspace
              </div>
            )}
          </div>
        )}
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


{renderDialog({
  isOpen: isCreateDialogOpen,
  title: "Create New Workspace",
  action: "Create",
  showInput: true,
  onConfirm: addWorkspace,
  confirmText: loading ? "Creating..." : "Create",
  confirmClass: loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700",
})}

{/* Rename Workspace Dialog */}
{renderDialog({
  isOpen: isRenameDialogOpen,
  title: "Rename Workspace",
  action: "Rename",
  showInput: true,
  onConfirm: renameWorkspace,
  confirmText: "Rename",
})}

{/* Delete Workspace Dialog */}
{renderDialog({
  isOpen: isDeleteDialogOpen,
  title: "Delete Workspace",
  action: "Delete",
  showInput: false,
  onConfirm: deleteWorkspace,
  confirmText: "Delete",
  confirmClass: "bg-red-600 hover:bg-red-700",
})}
{/* ADD: Project Dialogs */}
{/* Create Project Dialog */}
{isCreateProjectDialogOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dialog-overlay">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
      </div>
      <div className="p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setIsCreateProjectDialogOpen(false)
            setActiveWorkspaceForProject(null)
            setNewProjectName("")
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white"
          onClick={addProject}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  </div>
)}

{/* Rename Project Dialog */}
{isRenameProjectDialogOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dialog-overlay">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Rename Project</h3>
      </div>
      <div className="p-6">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setIsRenameProjectDialogOpen(false)
            setActiveProject(null)
            setNewProjectName("")
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm font-medium text-white"
          onClick={renameProject}
        >
          Rename
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete Project Dialog */}
{isDeleteProjectDialogOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dialog-overlay">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-700">
          Are you sure you want to delete "{activeProject?.name}"? This action cannot be undone.
        </p>
      </div>
      <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setIsDeleteProjectDialogOpen(false)
            setActiveProject(null)
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent rounded-md text-sm font-medium text-white"
          onClick={deleteProject}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
</div>
)
}

export default Sidebar