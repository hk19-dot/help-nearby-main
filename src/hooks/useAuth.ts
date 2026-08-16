import { useState, useEffect, useCallback } from "react";
import { getUser, logoutUser, User } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getUser);
  const navigate = useNavigate();

  // Re-read user from localStorage whenever focus returns to window
  // (e.g., after login in another tab)
  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener("focus", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("focus", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const refreshUser = useCallback(() => {
    setUser(getUser());
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };
};
