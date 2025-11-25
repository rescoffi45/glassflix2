import { User, CollectionItem } from '../types';

const DB_KEY = 'glassflix_users';
const CURRENT_USER_KEY = 'glassflix_current_user';

// Helper to get all users
const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(DB_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

// Helper to save users
const saveUsers = (users: User[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

export const authService = {
  // Sign Up a new user
  signup: (username: string, password: string): { success: boolean; message?: string; user?: User } => {
    const users = getUsers();
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists' };
    }

    const newUser: User = {
      username,
      password, // Note: In a real app, never store raw passwords. Use bcrypt on server.
      collection: []
    };

    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
  },

  // Login an existing user
  login: (username: string, password: string): { success: boolean; message?: string; user?: User } => {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    return { success: true, user };
  },

  // Save a specific user's collection
  saveUserCollection: (username: string, collection: CollectionItem[]) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users[userIndex].collection = collection;
      saveUsers(users);
    }
  },

  // Get the persisted session if page reloads
  checkSession: (): User | null => {
    const sessionStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!sessionStr) return null;
    
    // Re-validate against DB to get latest collection
    const sessionUser = JSON.parse(sessionStr);
    const users = getUsers();
    const freshUser = users.find(u => u.username === sessionUser.username);
    
    return freshUser || null;
  },

  setSession: (user: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};