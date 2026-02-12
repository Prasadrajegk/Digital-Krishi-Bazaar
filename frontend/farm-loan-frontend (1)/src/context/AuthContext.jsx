import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from localStorage (set by parent system or login)
      const storedUserId = localStorage.getItem('currentUserId');
      
      if (storedUserId) {
        // Fetch user from backend with roles
        const response = await userAPI.getById(storedUserId);
        setUser(response.data);
        console.log('User loaded from backend:', response.data);
      } else {
        // No user ID stored - you can either:
        // Option 1: Set a default user ID for testing
        // Option 2: Redirect to login
        // Option 3: Show user selection
        
        // For now, let's try to get user with ID 1
        try {
          const response = await userAPI.getById(1);
          localStorage.setItem('currentUserId', 1);
          setUser(response.data);
          console.log('Default user loaded:', response.data);
        } catch (err) {
          console.error('No default user found');
          setError('No user found. Please select a user.');
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      setError('Failed to load user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to different user by ID
  const switchUserById = async (userId) => {
    try {
      setLoading(true);
      const response = await userAPI.getById(userId);
      localStorage.setItem('currentUserId', userId);
      setUser(response.data);
      console.log('Switched to user:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Error switching user:', error);
      return { success: false, error: 'User not found' };
    } finally {
      setLoading(false);
    }
  };

  // Switch to different user by Email
  const switchUserByEmail = async (email) => {
    try {
      setLoading(true);
      const response = await userAPI.getByEmail(email);
      localStorage.setItem('currentUserId', response.data.userId);
      setUser(response.data);
      console.log('Switched to user:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Error switching user:', error);
      return { success: false, error: 'User not found' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => 
      role.roleName?.toUpperCase() === roleName.toUpperCase()
    );
  };

  // Get all roles of current user
  const getUserRoles = () => {
    if (!user || !user.roles) return [];
    return user.roles.map(role => role.roleName);
  };

  // Logout - clear user data
  const logout = () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    if (user?.userId) {
      await switchUserById(user.userId);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      error,
      userId: user?.userId,
      switchUserById,
      switchUserByEmail,
      hasRole,
      getUserRoles,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};