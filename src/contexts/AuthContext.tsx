import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type UserRole = 'user' | 'admin';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, secretCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  uploadImage: (file: File) => Promise<string>;
  uploadPdf: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secret codes for registration
const USER_SECRET_CODE = 'TELEGRAM_INTELLIGENCE_2024_SECURE_ACCESS';
const ADMIN_SECRET_CODE = 'TELEGRAM_INTELLIGENCE_2024_ADMIN_SUPER_ACCESS';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageStorage, setImageStorage] = useState<Record<string, string>>({});
  const [pdfStorage, setPdfStorage] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('tg_intelligence_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.role === 'admin');
      } catch {
        localStorage.removeItem('tg_intelligence_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('tg_intelligence_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      setIsAdmin(userWithoutPassword.role === 'admin');
      localStorage.setItem('tg_intelligence_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    secretCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Determine role based on secret code
    let role: UserRole = 'user';
    
    if (secretCode === ADMIN_SECRET_CODE) {
      role = 'admin';
    } else if (secretCode !== USER_SECRET_CODE) {
      return { success: false, error: 'Неверное кодовое слово. Доступ запрещен.' };
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('tg_intelligence_users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      return { success: false, error: 'Пользователь с таким email уже существует.' };
    }

    if (users.some((u: any) => u.username === username)) {
      return { success: false, error: 'Пользователь с таким именем уже существует.' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };

    users.push(newUser);
    localStorage.setItem('tg_intelligence_users', JSON.stringify(users));

    // Auto login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    setIsAdmin(role === 'admin');
    localStorage.setItem('tg_intelligence_user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('tg_intelligence_user');
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('tg_intelligence_user', JSON.stringify(updatedUser));
      
      // Update in users list too
      const users = JSON.parse(localStorage.getItem('tg_intelligence_users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, avatar: avatarUrl } : u
      );
      localStorage.setItem('tg_intelligence_users', JSON.stringify(updatedUsers));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const imageId = `img_${Date.now()}`;
        setImageStorage(prev => ({ ...prev, [imageId]: base64 }));
        localStorage.setItem('media_space_images', JSON.stringify({ ...imageStorage, [imageId]: base64 }));
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPdf = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const pdfId = `pdf_${Date.now()}`;
        setPdfStorage(prev => ({ ...prev, [pdfId]: base64 }));
        localStorage.setItem('media_space_pdfs', JSON.stringify({ ...pdfStorage, [pdfId]: base64 }));
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isAdmin,
      login, 
      register, 
      logout,
      updateUserAvatar,
      uploadImage,
      uploadPdf
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
