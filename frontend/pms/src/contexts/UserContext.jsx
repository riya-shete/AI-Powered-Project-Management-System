// UserContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get("http://localhost:8000/api/users/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const fetchedUsers = response.data.users || response.data;
      setUsers(fetchedUsers);
      localStorage.setItem("users", JSON.stringify(fetchedUsers));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");

      // Trying to load from localStorage as fallback
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          if (Array.isArray(parsedUsers)) {
            setUsers(parsedUsers);
          }
        } catch (parseError) {
          console.error("Error parsing stored users:", parseError);
          setUsers([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load users from localStorage first (for immediate display)
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers)) {
          setUsers(parsedUsers);
        }
      } catch (parseError) {
        console.error("Error parsing stored users:", parseError);
      }
    }
    
    // Then fetch fresh data
    fetchUsers();
  }, []);

return (
    <UserContext.Provider value={{ 
      users, 
      loading, 
      error, 
      refreshUsers: fetchUsers 
    }}>
      {children}
    </UserContext.Provider>
  );
};