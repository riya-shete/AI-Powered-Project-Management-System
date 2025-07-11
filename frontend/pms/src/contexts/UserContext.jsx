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
      const response = await axios.get("http://localhost:8000/api/users/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });

      const fetchedUsers = response.data.users || response.data;
      setUsers(fetchedUsers);
      localStorage.setItem("users", JSON.stringify(fetchedUsers));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");

      const storedUsers = localStorage.getItem("users");
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error, refreshUsers: fetchUsers }}>
      {children}
    </UserContext.Provider>
  );
};
