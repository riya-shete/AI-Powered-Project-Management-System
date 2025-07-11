import { createContext, useContext } from "react";
import { useState } from "react";

// Create the context
const WorkspaceContext = createContext({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
});

// Custom hook to use the context
export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

// Provider component to wrap around your app
export const WorkspaceProvider = ({ children }) => {
  // State to manage the current workspace
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  // Provide the context value
  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};