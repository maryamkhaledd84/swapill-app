import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, BookOpen, Clock, TrendingUp, Settings, ChevronRight, Edit, User, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SKILLS, USERS } from "../data/mockData";
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { useAuth } from '../App';
import { useUserProfile } from '../contexts/UserProfileContext';


interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  joinDate: string;
  avatar_url?: string;
  skills: any[];
  endorsements: number;
  exchanges: number;
  trustScore: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentUser, loading: profileLoading, updateProfile } = useUserProfile();
  const [showNameUpdateModal, setShowNameUpdateModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

   

  const handleDeleteSkill = async (skillId: string) => {
    try {
      console.log('Deleting skill:', skillId);
      
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }
      
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting skill:', error);
        toast.error('Failed to delete skill');
        return;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleUpdateName = async () => {
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      // Get user metadata from auth to find the original name
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        toast.error('Failed to get user data');
        return;
      }

      const originalName = authUser.user_metadata?.full_name;
      
      if (!originalName) {
        toast.error('No name found in your account data');
        return;
      }

      // Update the profiles table with the name from auth metadata
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: originalName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile name:', updateError);
        toast.error('Failed to update name');
        return;
      }

      toast.success('Name updated successfully!');
      
      // Refresh the user profile data
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error updating name:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleEditSkill = (skill: any) => {
    if (!user?.id) {
      toast.error('User not authenticated. Please refresh the page.');
      return;
    }
    console.log('Editing skill:', skill);
    // Navigate to profile page with skill context for editing
    navigate('/profile', { state: { userId: user.id, editingSkill: skill } });
  };

  // Check if user has 'New Member' name and show update modal
  useEffect(() => {
    if (currentUser && (currentUser.name === 'New Member' || currentUser.name === 'Name Pending' || !currentUser.name)) {
      setShowNameUpdateModal(true);
    }
  }, [currentUser]);

  const handleNameUpdate = async () => {
    if (!newFullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setUpdatingName(true);
    
    try {
      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: newFullName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile name:', updateError);
        toast.error('Failed to update name');
        return;
      }

      // Update auth metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: newFullName.trim()
        }
      });

      if (authUpdateError) {
        console.error('Error updating auth metadata:', authUpdateError);
        toast.error('Failed to update auth data');
        return;
      }

      toast.success('Name updated successfully!');
      setShowNameUpdateModal(false);
      setNewFullName('');
      
      // Refresh the page to show updated name
      window.location.reload();
      
    } catch (error) {
      console.error('Unexpected error updating name:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleAddSkill = () => {
    if (!user?.id) {
      toast.error('User not authenticated. Please refresh the page.');
      return;
    }
    console.log('Adding skill for user:', user.id);
    // Navigate to profile page with user context
    navigate('/profile', { state: { userId: user.id } });
  };

  const getAvatarDisplay = () => {
    if (!currentUser) return null;
    
    // Use uploaded avatar_url if available, otherwise show initials
    if (currentUser.avatar_url) {
      return (
        <img 
          src={currentUser.avatar_url} 
          alt={currentUser.name} 
          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl"
          style={{ aspectRatio: '1/1' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback to initials circle
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-circle')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback-circle absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 rounded-full text-white font-bold text-2xl';
              fallback.textContent = currentUser.name.charAt(0).toUpperCase();
              parent.appendChild(fallback);
            }
          }}
        />
      );
    }
    
    // Default to initials circle
    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl">
        <span className="text-white font-bold text-2xl">
          {currentUser.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Loading Skeleton */}
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 ring-4 ring-purple-500/10 p-1 bg-slate-800 shadow-xl mx-auto mb-6 animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-700/50"></div>
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-slate-700/50 rounded-lg mx-auto w-32 animate-pulse"></div>
              <div className="h-4 bg-slate-700/30 rounded-lg mx-auto w-48 animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading Spinner */}
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Loading Text */}
          <div className="text-white text-lg font-medium mb-2">
            {authLoading ? 'Initializing authentication...' : 'Loading your profile...'}
          </div>
          <div className="text-slate-400 text-sm">
            {authLoading ? 'Please wait while we establish your session' : 'Fetching your profile data'}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6 w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Profile Card Sidebar */}
        <aside className="lg:w-80 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="text-center">
              {getAvatarDisplay()}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#1e293b] rounded-full" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              {(!currentUser.name || currentUser.name === 'Name Pending' || currentUser.name === 'Unknown User') && (
                <button
                  onClick={handleUpdateName}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                >
                  Update Name
                </button>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-2">{currentUser.location}</p>
            
            {/* Display all skills */}
            {currentUser.skills.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills.map((skill, index) => (
                    <span 
                      key={skill.id || index}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                    >
                      {skill.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
               <div>
                  <div className="text-lg font-bold text-white">{currentUser.exchanges}</div>
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Swaps</div>
               </div>
               <div>
                  <div className="text-lg font-bold text-white">{currentUser.trustScore > 0 ? currentUser.trustScore.toFixed(1) : 'N/A'}</div>
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Rating</div>
               </div>
            </div>
          </div>

          <div className="glass-card p-4 space-y-1">
             <button className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 text-purple-400 font-medium">
                <div className="flex items-center gap-3">
                   <TrendingUp className="w-4 h-4" />
                   Overview
                </div>
                <ChevronRight className="w-4 h-4" />
             </button>
             <button className="w-full flex items-center justify-between p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                <div className="flex items-center gap-3">
                   <Settings className="w-4 h-4" />
                   Account Settings
                </div>
                <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-transparent">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                   <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">{currentUser.exchanges}</div>
                <div className="text-sm text-slate-400">Lessons Taught</div>
             </div>
             <div className="glass-card p-6 bg-gradient-to-br from-blue-500/5 to-transparent">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                   <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">0h</div>
                <div className="text-sm text-slate-400">Total Learning Time</div>
             </div>
             <div className="glass-card p-6 bg-gradient-to-br from-green-500/5 to-transparent">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                   <Plus className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-slate-400">Pending Requests</div>
             </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">My Active Skills</h3>
              <button 
                onClick={handleAddSkill}
                className="text-purple-400 text-sm font-bold flex items-center gap-2 hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
            {currentUser.skills.length > 0 ? (
              <div className="space-y-4">
                {currentUser.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                        {skill.title.charAt(0).toUpperCase()}{skill.title.split(' ').length > 1 ? skill.title.split(' ')[1].charAt(0).toUpperCase() : ''}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{skill.title}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">{skill.category}</div>
                        <div className="text-sm text-slate-400 mt-1">{skill.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditSkill(skill)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Edit skill"
                      >
                         <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete skill"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No skills added yet</h4>
                <p className="text-slate-400 mb-6">Add your first skill to start swapping expertise</p>
                <button 
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Skill
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-8">Recent Activity</h3>
            {currentUser.exchanges > 0 ? (
              <div className="space-y-8">
                {/* Show real activity when user has exchanges */}
                <div className="text-center py-8">
                  <div className="text-slate-400">Activity will appear here as you start swapping!</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No recent activity yet</h4>
                <p className="text-slate-400 mb-6">Start exploring to find a swap partner!</p>
                <Link 
                  to="/explore" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"
                >
                  Explore Experts
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Name Update Modal */}
      {showNameUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Update Your Name</h3>
            <p className="text-slate-400 mb-6">
              Your profile is showing as "New Member". Please enter your full name to personalize your profile.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNameUpdateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameUpdate}
                  disabled={updatingName || !newFullName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingName ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Name</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
