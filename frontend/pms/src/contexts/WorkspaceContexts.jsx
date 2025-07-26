"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"

// Creating the context
const WorkspaceContext = createContext({
  workspaces: [],
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
  loading: false,
  error: null,
  refreshWorkspaces: () => {},
  updateWorkspace: () => {},
  deleteWorkspace: () => {},
  createWorkspace: () => {},
})

// Custom hook to use the context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}

// Provider component to wrap around the app
export const WorkspaceProvider = ({ children }) => {
  const location = useLocation()

  // State management
  const [workspaces, setWorkspaces] = useState([])
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ADDED: State to track project-to-workspace mapping
  const [projectWorkspaceMap, setProjectWorkspaceMap] = useState({})

  // Use ref to track if we're already updating to prevent loops
  const isUpdatingRef = useRef(false)

  // ADDED: Get token once and reuse
  const token = localStorage.getItem("token")

  // ADDED: Helper function to extract project ID from URL
  const extractProjectIdFromPath = useCallback((pathname) => {
    const projectMatch = pathname.match(/\/project\/(\d+)/)
    const projectId = projectMatch ? Number.parseInt(projectMatch[1]) : null
    console.log(">>>> extractProjectIdFromPath:", pathname, "->", projectId)
    return projectId
  }, [])

  // ADDED: Function to fetch project-workspace mappings from projects API
  const fetchProjectWorkspaceMappings = useCallback(async () => {
    if (!token) {
      console.log(">>>> No token available for fetching projects")
      return {}
    }

    try {
      console.log(">>>>Fetching project-workspace mappings...")

      // ADDED: Fetch projects to get workspace relationships
      const response = await axios.get("http://localhost:8000/api/projects/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      console.log(">>>> Projects API response:", response.data)

      let projectsData = []
      if (response.data && typeof response.data === "object") {
        projectsData =
          response.data.results ||
          response.data.data ||
          response.data.projects ||
          (Array.isArray(response.data) ? response.data : [])
      }

      console.log(">>>> Extracted projects data:", projectsData)

      // Build the mapping from projects data
      const mapping = {}
      projectsData.forEach((project) => {
        if (project.id && project.workspace) {
          // Handle both workspace ID and workspace object
          const workspaceId = typeof project.workspace === "object" ? project.workspace.id : project.workspace
          mapping[project.id] = workspaceId
          console.log(`>>> Mapped project ${project.id} (${project.name}) -> workspace ${workspaceId}`)
        }
      })

      console.log(">>> Final project-workspace mapping:", mapping)
      return mapping
    } catch (error) {
      console.error(">>>Error fetching project mappings:", error)
      return {}
    }
  }, [token])

  // Helper function to get standard pages for a workspace/project
  const getStandardPages = useCallback((workspaceId, projectId) => {
    const actualProjectId = projectId || localStorage.getItem("currentProjectId") || "1"
    console.log(">>> getStandardPages called with:", { workspaceId, projectId, actualProjectId })

    return [
      {
        id: 1,
        name: "Task dashboard",
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
  }, [])

  // Helper function to get random color for workspace
  const getRandomColor = useCallback(() => {
    const colors = ["blue", "purple", "green", "red", "orange", "pink"]
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  // MODIFIED: Helper function to transform API workspace data
  const transformWorkspaceData = useCallback(
    (apiWorkspaces, projectMappings = {}) => {
      if (!Array.isArray(apiWorkspaces)) {
        console.log(">>> transformWorkspaceData: Invalid data format", apiWorkspaces)
        return []
      }

      console.log("🔄 Transforming workspace data:", apiWorkspaces)
      console.log("🔄 Using project mappings:", projectMappings)

      const transformedWorkspaces = apiWorkspaces.map((workspace) => {
        // ADDED: Find projects that belong to this workspace
        const workspaceProjects = Object.entries(projectMappings)
          .filter(([projectId, workspaceId]) => workspaceId === workspace.id)
          .map(([projectId]) => ({ id: Number.parseInt(projectId), name: `Project ${projectId}` }))

        const transformed = {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          icon: workspace.icon || workspace.name.charAt(0).toUpperCase(),
          color: workspace.color || getRandomColor(),
          isActive: false, // Will be set based on current path
          pages: workspace.pages || getStandardPages(workspace.id),
          // ADDED: Include projects from mapping
          projects: workspaceProjects,
          project_id: workspace.project_id,
          // Include original API data
          ...workspace,
        }

        console.log("✅ Transformed workspace:", transformed.name, "with projects:", workspaceProjects)
        return transformed
      })

      return transformedWorkspaces
    },
    [getRandomColor, getStandardPages],
  )

  // API functions
  const workspaceAPI = {
    getAll: async () => {
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log(">>>Fetching workspaces from API...")

      const response = await axios.get("http://localhost:8000/api/workspaces/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      console.log(">>> Workspaces API Response:", response.data)

      // Handle different response structures
      let workspacesData
      if (response.data && typeof response.data === "object") {
        workspacesData =
          response.data.results ||
          response.data.data ||
          response.data.workspaces ||
          (Array.isArray(response.data) ? response.data : [])
      } else {
        workspacesData = []
      }

      console.log(">>> Extracted workspaces data:", workspacesData)

      // ADDED: Fetch project mappings and combine with workspace data
      const projectMappings = await fetchProjectWorkspaceMappings()
      setProjectWorkspaceMap(projectMappings)

      return transformWorkspaceData(workspacesData, projectMappings)
    },

    create: async (workspaceData) => {
      const user_id = localStorage.getItem("user_id")
      const response = await axios.post(
        "http://localhost:8000/api/workspaces/",
        {
          name: workspaceData.name,
          description: workspaceData.description || "New workspace",
          icon: workspaceData.icon || "workspace_icon",
          owner: Number.parseInt(user_id),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      return transformWorkspaceData([response.data], projectWorkspaceMap)[0]
    },

    update: async (workspaceId, workspaceData) => {
      const response = await axios.put("http://localhost:8000/api/workspaces/", workspaceData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          "X-Object-ID": workspaceId,
        },
      })
      return transformWorkspaceData([response.data], projectWorkspaceMap)[0]
    },

    delete: async (workspaceId) => {
      const response = await axios.delete("http://localhost:8000/api/workspaces/", {
        headers: {
          Authorization: `Token ${token}`,
          "X-Object-ID": workspaceId,
        },
      })
      return response.data
    },
  }

  // Fetch workspaces from API
  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    setError(null)

    console.log("🔄 fetchWorkspaces called")

    try {
      const fetchedWorkspaces = await workspaceAPI.getAll()
      console.log(">>> FETCHED WORKSPACES:", fetchedWorkspaces)
      setWorkspaces(fetchedWorkspaces)

      // Save to localStorage
      localStorage.setItem("workspaces", JSON.stringify(fetchedWorkspaces))

      return fetchedWorkspaces
    } catch (err) {
      console.error(">>> Error fetching workspaces:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch workspaces")

      // Try to load from localStorage as fallback
      const storedWorkspaces = localStorage.getItem("workspaces")
      if (storedWorkspaces) {
        try {
          const parsedWorkspaces = JSON.parse(storedWorkspaces)
          if (Array.isArray(parsedWorkspaces)) {
            console.log(">>>FALLBACK WORKSPACES FROM LOCALSTORAGE:", parsedWorkspaces)
            setWorkspaces(parsedWorkspaces)
            return parsedWorkspaces
          }
        } catch (parseError) {
          console.error("Error parsing stored workspaces:", parseError)
        }
      }

      // ENHANCED: Create a more realistic default workspace
      const currentProjectId = extractProjectIdFromPath(location.pathname)
      const defaultWorkspace = {
        id: 1,
        name: "Default Workspace",
        icon: "D",
        color: "blue",
        isActive: true,
        pages: getStandardPages(1, currentProjectId),
        description: "Default workspace",
        projects: currentProjectId ? [{ id: currentProjectId, name: `Project ${currentProjectId}` }] : [],
        project_id: currentProjectId,
      }

      console.log(">>>Created default workspace:", defaultWorkspace)
      setWorkspaces([defaultWorkspace])

      // Also update the mapping
      if (currentProjectId) {
        setProjectWorkspaceMap({ [currentProjectId]: 1 })
      }

      return [defaultWorkspace]
    } finally {
      setLoading(false)
    }
  }, [extractProjectIdFromPath, location.pathname, getStandardPages])

  // Create new workspace
  const createWorkspace = useCallback(
    async (workspaceData) => {
      setLoading(true)
      setError(null)
      try {
        const newWorkspace = await workspaceAPI.create(workspaceData)

        // Add pages to the new workspace
        newWorkspace.pages = getStandardPages(newWorkspace.id)

        setWorkspaces((prev) => [...prev, newWorkspace])

        // Update localStorage
        const updatedWorkspaces = [...workspaces, newWorkspace]
        localStorage.setItem("workspaces", JSON.stringify(updatedWorkspaces))

        return newWorkspace
      } catch (err) {
        console.error("Error creating workspace:", err)
        setError(err.response?.data?.message || err.message || "Failed to create workspace")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getStandardPages, workspaces],
  )

  // Update workspace
  const updateWorkspace = useCallback(async (workspaceId, workspaceData) => {
    setLoading(true)
    setError(null)
    try {
      const updatedWorkspace = await workspaceAPI.update(workspaceId, workspaceData)

      setWorkspaces((prev) => prev.map((w) => (w.id === workspaceId ? { ...w, ...updatedWorkspace } : w)))

      // Update current workspace if it's the one being updated
      setCurrentWorkspace((prev) => {
        if (prev && prev.id === workspaceId) {
          return { ...prev, ...updatedWorkspace }
        }
        return prev
      })

      // Update localStorage
      setWorkspaces((prev) => {
        const updatedWorkspaces = prev.map((w) => (w.id === workspaceId ? { ...w, ...updatedWorkspace } : w))
        localStorage.setItem("workspaces", JSON.stringify(updatedWorkspaces))
        return prev
      })

      return updatedWorkspace
    } catch (err) {
      console.error("Error updating workspace:", err)
      setError(err.response?.data?.message || err.message || "Failed to update workspace")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete workspace
  const deleteWorkspace = useCallback(async (workspaceId) => {
    setLoading(true)
    setError(null)
    try {
      await workspaceAPI.delete(workspaceId)

      setWorkspaces((prev) => {
        const filtered = prev.filter((w) => w.id !== workspaceId)
        // Update localStorage
        localStorage.setItem("workspaces", JSON.stringify(filtered))
        return filtered
      })

      // Clear current workspace if it's the one being deleted
      setCurrentWorkspace((prev) => {
        if (prev && prev.id === workspaceId) {
          localStorage.removeItem("currentWorkspace")
          return null
        }
        return prev
      })
    } catch (err) {
      console.error("Error deleting workspace:", err)
      setError(err.response?.data?.message || err.message || "Failed to delete workspace")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ENHANCED: Determine current workspace based on project ID in URL
  const determineCurrentWorkspace = useCallback(
    (workspacesList, currentPath) => {
      console.log("=== DETERMINE CURRENT WORKSPACE ===")
      console.log(">>> Current path:", currentPath)
      console.log(
        ">>> Available workspaces:",
        workspacesList.map((w) => ({ id: w.id, name: w.name })),
      )
      console.log(">>> Project-workspace mapping:", projectWorkspaceMap)

      if (!workspacesList || workspacesList.length === 0 || !currentPath) {
        console.log(">>> No workspaces or path available")
        return null
      }

      // Extract project ID from URL
      const projectId = extractProjectIdFromPath(currentPath)
      console.log("🔍 Extracted project ID from URL:", projectId)

      if (!projectId) {
        console.log(">>>No project ID found in URL")
        return workspacesList.length > 0 ? workspacesList[0] : null
      }

      // FIXED: Find workspace by project ID mapping
      const workspaceId = projectWorkspaceMap[projectId]
      console.log(">>> Mapped workspace ID:", workspaceId)

      if (workspaceId) {
        const foundWorkspace = workspacesList.find((workspace) => workspace.id === workspaceId)
        if (foundWorkspace) {
          console.log("✅ Found workspace via mapping:", foundWorkspace.name)
          return foundWorkspace
        }
      }

      // REMOVED: The "LAST RESORT" fallback that was causing the issue
      console.log(">>> No workspace found for project ID:", projectId)
      console.log(">>> Available mappings:", Object.keys(projectWorkspaceMap))

      // ADDED: Better fallback - don't change workspace if we can't find the right one
      console.log(">>>Keeping current workspace until proper mapping is available")
      return null
    },
    [projectWorkspaceMap, extractProjectIdFromPath],
  )

  // Load workspaces on mount
  useEffect(() => {
    console.log(">>> Component mounted, loading workspaces...")

    // Load from localStorage first for immediate display
    const storedWorkspaces = localStorage.getItem("workspaces")
    if (storedWorkspaces) {
      try {
        const parsedWorkspaces = JSON.parse(storedWorkspaces)
        if (Array.isArray(parsedWorkspaces)) {
          console.log(">>> Loaded workspaces from localStorage:", parsedWorkspaces)
          setWorkspaces(parsedWorkspaces)
        }
      } catch (parseError) {
        console.error("Error parsing stored workspaces:", parseError)
      }
    }

    // Then fetch fresh data
    fetchWorkspaces()
  }, []) // Removed dependencies to prevent infinite loops

  // ENHANCED: Update current workspace when location or workspaces change
  useEffect(() => {
    console.log("++ === WORKSPACE DETECTION EFFECT ===")
    console.log("++ Current pathname:", location.pathname)
    console.log("++ Available workspaces:", workspaces.length)
    console.log("++ Current workspace:", currentWorkspace?.name)
    console.log("++ Is updating:", isUpdatingRef.current)
    console.log("++ Project mappings available:", Object.keys(projectWorkspaceMap).length)

    if (isUpdatingRef.current || workspaces.length === 0 || !location.pathname) {
      console.log("⏸++ Skipping update - updating:", isUpdatingRef.current, "workspaces:", workspaces.length)
      return
    }

    // ADDED: Only proceed if we have project mappings
    if (Object.keys(projectWorkspaceMap).length === 0) {
      console.log("⏸++ Waiting for project mappings to be loaded...")
      return
    }

    const detectedWorkspace = determineCurrentWorkspace(workspaces, location.pathname)
    console.log("++ DETECTED WORKSPACE:", detectedWorkspace?.name)

    // Only update if the detected workspace is different from current
    if (detectedWorkspace && (!currentWorkspace || currentWorkspace.id !== detectedWorkspace.id)) {
      console.log("++ Updating active workspace from", currentWorkspace?.name, "to", detectedWorkspace.name)
      isUpdatingRef.current = true

      // Update the workspace's isActive status
      setWorkspaces((prev) =>
        prev.map((w) => ({
          ...w,
          isActive: w.id === detectedWorkspace.id,
        })),
      )

      // Set as current workspace
      setCurrentWorkspace(detectedWorkspace)

      // Store current workspace in localStorage
      localStorage.setItem("currentWorkspace", JSON.stringify(detectedWorkspace))

      // Reset the updating flag after a short delay
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 100)
    } else if (!detectedWorkspace) {
      console.log("🔄 No workspace detected for current project, keeping existing workspace")
    }
  }, [location.pathname, workspaces, currentWorkspace, determineCurrentWorkspace, projectWorkspaceMap])

  // Load current workspace from localStorage on mount
  useEffect(() => {
    const storedCurrentWorkspace = localStorage.getItem("currentWorkspace")
    if (storedCurrentWorkspace && !currentWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(storedCurrentWorkspace)
        console.log("📦 Loaded current workspace from localStorage:", parsedWorkspace.name)
        setCurrentWorkspace(parsedWorkspace)
      } catch (parseError) {
        console.error("Error parsing stored current workspace:", parseError)
      }
    }
  }, [currentWorkspace])

  // Custom setCurrentWorkspace that also updates localStorage and workspace active status
  const handleSetCurrentWorkspace = useCallback((workspace) => {
    console.log("🔄 handleSetCurrentWorkspace CALLED with:", workspace?.name)
    if (isUpdatingRef.current) return

    isUpdatingRef.current = true

    setCurrentWorkspace(workspace)

    if (workspace) {
      console.log("🔄 Updating workspaces active status for workspace ID:", workspace.id)
      // Update workspaces active status
      setWorkspaces((prev) =>
        prev.map((w) => ({
          ...w,
          isActive: w.id === workspace.id,
        })),
      )

      // Store in localStorage
      localStorage.setItem("currentWorkspace", JSON.stringify(workspace))
    } else {
      localStorage.removeItem("currentWorkspace")
    }

    // Reset the updating flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 100)
  }, [])

  // ADDED: Debug logging for state changes
  useEffect(() => {
    console.log("🔍 === WORKSPACE STATE DEBUG ===")
    console.log(">> WORKSPACES STATE CHANGED:", workspaces)
    console.log(">> Number of workspaces:", workspaces.length)
    console.log(">> Current URL:", location.pathname)
    console.log(">> Project-Workspace Map:", projectWorkspaceMap)
    workspaces.forEach((ws, index) => {
      console.log(`   [${index}] ${ws.name} (ID: ${ws.id}, Active: ${ws.isActive})`)
      if (ws.projects && ws.projects.length > 0) {
        console.log(
          `       Projects:`,
          ws.projects.map((p) => `${p.id}:${p.name}`),
        )
      } else {
        console.log(`       Projects: []`)
      }
    })
    console.log("🔍 === END DEBUG ===")
  }, [workspaces, location.pathname, projectWorkspaceMap])

  useEffect(() => {
    console.log("🎯 CURRENT WORKSPACE CHANGED:", currentWorkspace?.name || "None")
    if (currentWorkspace) {
      console.log("   Name:", currentWorkspace.name)
      console.log("   ID:", currentWorkspace.id)
      console.log("   Projects:", currentWorkspace.projects)
    }
  }, [currentWorkspace])

  // Context value
  const contextValue = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace: handleSetCurrentWorkspace,
    loading,
    error,
    refreshWorkspaces: fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setWorkspaces, // For external updates if needed
    // ADDED: Expose project-workspace mapping for debugging
    projectWorkspaceMap,
  }

  return <WorkspaceContext.Provider value={contextValue}>{children}</WorkspaceContext.Provider>
}
