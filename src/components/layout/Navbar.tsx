import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, LayoutDashboard, Compass, Info, User, LogOut, Menu, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import AuthModal from "../auth/AuthModal";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../App";
import { useUserProfile } from "../../contexts/UserProfileContext";
import toast from 'react-hot-toast';

// Color palette for dynamic avatar backgrounds
const avatarColors = [
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Purple
];

// Helper function to get consistent color for user
const getAvatarColor = (userId: string, fullName?: string) => {
  const seed = fullName || userId || 'default';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

// Modern Avatar Component for Navbar
function UserAvatar({ avatarUrl, name, size = "small", userId }: { avatarUrl?: string; name: string; size?: "small" | "medium"; userId?: string }) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10"
  };
  
  // Handle image errors with fallback to initials
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Fallback to initials circle
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-circle')) {
      const fallback = document.createElement('div');
      const avatarColor = getAvatarColor(userId || '', name);
      fallback.className = 'fallback-circle absolute inset-0 flex items-center justify-center rounded-full text-white font-bold text-sm';
      fallback.style.backgroundColor = avatarColor;
      fallback.textContent = name.charAt(0).toUpperCase();
      parent.appendChild(fallback);
    }
  };
  
  if (avatarUrl) {
    return (
      <div className="relative">
        <img 
          src={avatarUrl}
          alt={name}
          onError={handleImageError}
          className={cn(
            "rounded-full object-cover border-2 border-white/20",
            sizeClasses[size]
          )}
        />
      </div>
    );
  }
  
  // Default to initials circle
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center border-2 border-white/20",
        sizeClasses[size]
      )}
      style={{ backgroundColor: getAvatarColor(userId || '', name) }}
    >
      <span className="text-white font-bold text-sm">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { currentUser: userProfile } = useUserProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close auth modal when user is found
  useEffect(() => {
    if (user && userProfile) {
      setAuthModalOpen(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log('Starting logout process...');
      
      // Call supabase signOut directly to ensure proper logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        toast.error('Error signing out');
        return;
      }
      
      console.log('Successfully signed out from Supabase');
      
      setLogoutModalOpen(false);
      setAuthModalOpen(false);
      
      // Clear any localStorage data
      localStorage.removeItem('swapill_user');
      
      // Force navigation to home page
      navigate('/', { replace: true });
      
      toast.success('Logged out successfully');
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('An error occurred during logout');
      
      // Still try to clean up and redirect on error
      setLogoutModalOpen(false);
      setAuthModalOpen(false);
      localStorage.removeItem('swapill_user');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    if (!isLoggingOut) {
      setLogoutModalOpen(false);
    }
  };

  const navLinks = [
    { name: "Explore", path: "/explore", icon: Compass, requiresAuth: false },
    { name: "How It Works", path: "/how-it-works", icon: Info, requiresAuth: false },
    { name: "Chat", path: "/chat", icon: MessageSquare, requiresAuth: true },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Swapill</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isDisabled = link.requiresAuth && !user;
            return (
              <div key={link.path}>
                {isDisabled ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-not-allowed">
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </span>
                ) : (
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                      location.pathname === link.path ? "text-white" : "text-slate-400"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user && userProfile ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 group p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <UserAvatar avatarUrl={userProfile.avatar_url} name={userProfile.name} size="small" userId={user?.id} />
                <span className="text-sm font-medium text-gray-200 hidden sm:block">{userProfile.name}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="btn-primary text-sm px-6 py-2"
              >
                Sign Up
              </button>
            </div>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {!loading && !user && (
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onModeChange={setAuthMode}
          onAuthSuccess={() => {
            // Auth success is handled by AuthProvider, no action needed here
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
          onClick={cancelLogout}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!isLoggingOut && (
              <button
                onClick={cancelLogout}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                {isLoggingOut ? 'Logging out...' : 'Do you want to log out?'}
              </h3>
              
              <p className="text-gray-300 mb-8">
                {isLoggingOut 
                  ? 'Please wait while we sign you out securely...'
                  : 'You can always come back and continue your skill swapping journey.'
                }
              </p>

              {/* Loading spinner or buttons */}
              {isLoggingOut ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-400 hover:to-orange-500 transition-all font-medium shadow-lg shadow-red-500/25"
                  >
                    Yes, Log Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-slate-900 border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white font-semibold text-lg">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {navLinks.map((link) => {
                const isDisabled = link.requiresAuth && !user;
                return (
                  <div key={link.path}>
                    {isDisabled ? (
                      <span className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-not-allowed p-3">
                        <link.icon className="w-5 h-5" />
                        {link.name}
                      </span>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 text-sm font-medium p-3 rounded-lg transition-colors min-h-[44px] ${
                          location.pathname === link.path
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            
            {user && userProfile && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <UserAvatar 
                    avatarUrl={userProfile.avatar_url} 
                    name={userProfile.name} 
                    size="small" 
                    userId={user?.id} 
                  />
                  <div>
                    <p className="text-white font-medium">{userProfile.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setLogoutModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 p-3 rounded-lg transition-colors min-h-[44px]"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
