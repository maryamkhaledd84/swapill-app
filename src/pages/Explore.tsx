import React, { useState, useEffect } from "react";

// HMR Force Sync - Clear any cached filter settings
console.log('RE-RENDER: Explore component mounting');
if (typeof window !== 'undefined') {
  localStorage.removeItem('activeCategory');
  localStorage.removeItem('searchQuery');
  console.log('Cleared localStorage cache');
}
import { Search, Code, Smartphone, Palette, TrendingUp, Globe, PenTool, Music, ChefHat, Sparkles, Camera, Mic, Kanban, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { USERS, SKILLS } from "../data/mockData";
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

// Skill Categories with icons (same as Profile)
const SKILL_CATEGORIES = [
  { id: 'all', name: 'All Skills', icon: Search },
  { id: 'web', name: 'Web Dev', icon: Code },
  { id: 'mobile', name: 'Mobile Dev', icon: Smartphone },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'languages', name: 'Languages', icon: Globe },
  { id: 'writing', name: 'Writing', icon: PenTool },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'cooking', name: 'Cooking', icon: ChefHat },
  { id: 'prompt', name: 'Prompt Eng', icon: Sparkles },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'speaking', name: 'Speaking', icon: Mic },
  { id: 'management', name: 'Project Mgmt', icon: Kanban },
];

// 20 Diverse Egyptian Experts with Professional Details
const EGYPTIAN_EXPERTS = [
  {
    id: 1,
    name: "Ahmed Mansour",
    initials: "AM",
    useAvatar: true,
    avatarType: "panda",
    topSkill: { title: "React Development", category: "web", icon: Code },
    skills: ["React", "TypeScript", "Node.js"],
    rating: 4.9,
    swaps: 23,
    bio: "Passionate Web Developer with 3 years experience in modern React applications"
  },
  {
    id: 2,
    name: "Sara Hassan",
    initials: "SH",
    useAvatar: false,
    gradient: "from-purple-500 to-violet-600",
    topSkill: { title: "Middle Eastern Cooking", category: "cooking", icon: ChefHat },
    skills: ["Egyptian Cuisine", "Levantine Dishes", "Desserts"],
    rating: 5.0,
    swaps: 31,
    bio: "Professional chef specializing in authentic Middle Eastern and Egyptian cuisine"
  },
  {
    id: 3,
    name: "Omar Sherif",
    initials: "OS",
    useAvatar: true,
    avatarType: "robot",
    topSkill: { title: "Prompt Engineering", category: "prompt", icon: Sparkles },
    skills: ["AI Prompts", "ChatGPT", "Midjourney"],
    rating: 4.7,
    swaps: 18,
    bio: "AI specialist helping businesses leverage cutting-edge language models"
  },
  {
    id: 4,
    name: "Mariam Ali",
    initials: "MA",
    useAvatar: false,
    gradient: "from-blue-500 to-indigo-600",
    topSkill: { title: "Arabic Language", category: "languages", icon: Globe },
    skills: ["Modern Arabic", "Classical Arabic", "Egyptian Dialect"],
    rating: 4.9,
    swaps: 27,
    bio: "Certified Arabic teacher with expertise in Modern Standard Arabic and Egyptian dialect"
  },
  {
    id: 5,
    name: "Khaled Ibrahim",
    initials: "KI",
    useAvatar: true,
    avatarType: "cat",
    topSkill: { title: "Mobile Development", category: "mobile", icon: Smartphone },
    skills: ["iOS", "Android", "React Native"],
    rating: 4.8,
    swaps: 22,
    bio: "Mobile app developer creating intuitive cross-platform applications"
  },
  {
    id: 6,
    name: "Fatima Mahmoud",
    initials: "FM",
    useAvatar: false,
    gradient: "from-pink-500 to-rose-600",
    topSkill: { title: "UI/UX Design", category: "design", icon: Palette },
    skills: ["Figma", "Adobe XD", "Prototyping"],
    rating: 4.6,
    swaps: 15,
    bio: "Creative designer focused on user-centered digital experiences"
  },
  {
    id: 7,
    name: "Youssef Abdel",
    initials: "YA",
    useAvatar: true,
    avatarType: "rabbit",
    topSkill: { title: "Photography", category: "photography", icon: Camera },
    skills: ["Portrait", "Landscape", "Event Photography"],
    rating: 4.9,
    swaps: 34,
    bio: "Professional photographer capturing moments across Egypt and the Middle East"
  },
  {
    id: 8,
    name: "Nadia Kamel",
    initials: "NK",
    useAvatar: false,
    gradient: "from-green-500 to-emerald-600",
    topSkill: { title: "Public Speaking", category: "speaking", icon: Mic },
    skills: ["Presentation Skills", "Debate Coaching", "Corporate Training"],
    rating: 4.8,
    swaps: 19,
    bio: "Communication expert helping professionals master the art of public speaking"
  },
  {
    id: 9,
    name: "Mohamed Elsayed",
    initials: "ME",
    useAvatar: true,
    avatarType: "girl",
    topSkill: { title: "Project Management", category: "management", icon: Kanban },
    skills: ["Agile", "Scrum", "Team Leadership"],
    rating: 4.7,
    swaps: 26,
    bio: "PMP certified project manager with 8 years in tech and construction"
  },
  {
    id: 10,
    name: "Layla Hussein",
    initials: "LH",
    useAvatar: false,
    gradient: "from-orange-500 to-amber-600",
    topSkill: { title: "Digital Marketing", category: "marketing", icon: TrendingUp },
    skills: ["SEO", "Social Media", "Content Strategy"],
    rating: 4.5,
    swaps: 21,
    bio: "Marketing strategist helping brands grow their online presence"
  },
  {
    id: 11,
    name: "Karim Nabil",
    initials: "KN",
    useAvatar: true,
    avatarType: "boy",
    topSkill: { title: "Music Production", category: "music", icon: Music },
    skills: ["Beat Making", "Audio Engineering", "MIDI Production"],
    rating: 4.8,
    swaps: 16,
    bio: "Music producer creating beats for artists across the Middle East"
  },
  {
    id: 12,
    name: "Rania Salah",
    initials: "RS",
    useAvatar: false,
    gradient: "from-teal-500 to-cyan-600",
    topSkill: { title: "Technical Writing", category: "writing", icon: PenTool },
    skills: ["Documentation", "API Writing", "Content Creation"],
    rating: 4.6,
    swaps: 13,
    bio: "Technical writer making complex concepts simple and accessible"
  },
  {
    id: 13,
    name: "Hassan Ali",
    initials: "HA",
    useAvatar: true,
    avatarType: "artist",
    topSkill: { title: "Web Development", category: "web", icon: Code },
    skills: ["Vue.js", "Python", "Django"],
    rating: 4.7,
    swaps: 24,
    bio: "Full-stack developer specializing in Python web frameworks"
  },
  {
    id: 14,
    name: "Mona Fathy",
    initials: "MF",
    useAvatar: false,
    gradient: "from-violet-500 to-purple-600",
    topSkill: { title: "Business English", category: "languages", icon: Globe },
    skills: ["Business English", "IELTS Prep", "Corporate Training"],
    rating: 4.9,
    swaps: 29,
    bio: "English language coach specializing in business communication"
  },
  {
    id: 15,
    name: "Tarek Omar",
    initials: "TO",
    useAvatar: true,
    avatarType: "scientist",
    topSkill: { title: "Data Science", category: "web", icon: Code },
    skills: ["Machine Learning", "Python", "Data Analysis"],
    rating: 4.8,
    swaps: 20,
    bio: "Data scientist helping businesses make data-driven decisions"
  },
  {
    id: 16,
    name: "Dalia Magdy",
    initials: "SG",
    useAvatar: false,
    gradient: "from-rose-500 to-pink-600",
    topSkill: { title: "Content Writing", category: "writing", icon: PenTool },
    skills: ["Blog Writing", "Copywriting", "SEO Content"],
    rating: 4.4,
    swaps: 12,
    bio: "Content writer creating engaging stories for digital platforms"
  },
  {
    id: 19,
    name: "Mahmoud Reda",
    initials: "MR",
    useAvatar: true,
    avatarType: "robot",
    topSkill: { title: "AI Integration", category: "prompt", icon: Sparkles },
    skills: ["ChatGPT", "Automation", "AI Strategy"],
    rating: 4.6,
    swaps: 14,
    bio: "AI consultant helping businesses integrate artificial intelligence"
  },
  {
    id: 20,
    name: "Aya Khaled",
    initials: "AK",
    useAvatar: false,
    gradient: "from-cyan-500 to-teal-600",
    topSkill: { title: "Social Media Marketing", category: "marketing", icon: TrendingUp },
    skills: ["Instagram", "Facebook", "Content Strategy"],
    rating: 4.7,
    swaps: 25,
    bio: "Social media expert building strong online communities"
  }
];

export default function Explore() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realUsers, setRealUsers] = useState<any[]>([]);

  // Fetch real users from Supabase
  useEffect(() => {
    const fetchRealUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all profiles from Supabase
        console.log('=== EXPLORE PAGE FETCH DEBUG ===');
        console.log('Fetching profiles from database...');
        
        const { data, error } = await supabase.from('profiles').select('*').order('updated_at', { ascending: true });
        if (error) {
          console.error('=== DETAILED SUPABASE ERROR ===');
          console.dir(error, { depth: null });
          console.error('=== END ERROR DETAILS ===');
        }
        
        // Deduplicate by ID immediately
        const uniqueData = data ? data.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) : [];

        console.log(`Found ${data?.length || 0} profiles in database`);
        console.log(`Unique profiles after dedup: ${uniqueData.length}`);

        // Transform profiles to match the expected user structure
        const transformedUsers = await Promise.all(uniqueData.map(async profile => {
          console.log('Processing profile:', profile);
          console.log('Profile ID:', profile.id);
          console.log('Profile name:', profile.full_name);
          
          // Display logic: use profile data directly
          const displayName = profile.full_name || profile.email?.split('@')[0] || 'Member';
          
          // Fetch skills for this profile
          const { data: userSkills, error: skillsError } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', profile.id);
          
          console.log(`Skills for profile ${profile.id}:`, userSkills);
          
          if (skillsError) {
            console.error('=== SKILLS QUERY ERROR ===');
            console.dir(skillsError, { depth: null });
            console.error('=== END SKILLS ERROR ===');
          }
          
          // Determine top skill (first skill or default)
          const topSkill = userSkills && userSkills.length > 0 
            ? {
                title: userSkills[0].title,
                category: userSkills[0].category,
                icon: SKILL_CATEGORIES.find(cat => cat.id === userSkills[0].category)?.icon || Search
              }
            : {
                title: 'Skill Exchange',
                category: 'all',
                icon: Search
              };
          
          // Hash function for persistent random numbers based on user ID
          const hashString = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              const char = str.charCodeAt(i);
              hash = ((hash << 5) - hash) + char;
              hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash);
          };
          
          // Check if this is one of the 3 new users
          const isNewUser = ['dalia helal', 'ahmed nagy', 'aya amgad abdelhamed'].includes((profile.full_name || '').toLowerCase());
          
          // Generate mock data for established users only
          let mockRating = 0;
          let mockSwaps = 0;
          
          if (!isNewUser) {
            const userHash = hashString(profile.id || '');
            // Use hash to generate consistent random numbers (4.5-4.9 rating, 12-35 swaps)
            mockRating = 4.5 + (userHash % 5) * 0.1; // 4.5 to 4.9
            mockSwaps = 12 + (userHash % 24); // 12 to 35
          }
          
          // Use the displayName that was calculated with proper priority logic
          return {
            id: profile.id,
            name: displayName,
            initials: displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            avatar_url: profile.avatar_url, // Include avatar_url from profiles table
            useAvatar: false,
            gradient: "from-blue-500 to-indigo-600",
            bio: profile.bio || 'No bio available',
            skills: userSkills || [], // Use actual skills from database
            rating: mockRating, // Mock rating for established users, 0 for new users
            swaps: mockSwaps, // Mock swaps for established users, 0 for new users
            trust_score: 0,
            exchanges: 0,
            topSkill: topSkill
          };
        }));

        setRealUsers(transformedUsers);
      } catch (error) {
        console.error('Error in fetchRealUsers:', error);
        setRealUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealUsers();

    // REMOVED: syncAllNullProfiles function was causing 400 Bad Request errors

    // REMOVED: syncCurrentUserProfile function was causing 400 Bad Request errors

    // Set up Supabase realtime for auto-refresh
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profile change detected:', payload);
          fetchRealUsers(); // Re-fetch users when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Clean filtering logic - use unique, sorted data from Supabase
  useEffect(() => {
    // Use only real users from database - already unique and sorted by created_at descending
    const experts = realUsers;
    console.log('=== FILTERING DEBUG ===');
    console.log('RE-RENDER: Real users from database (already unique & sorted):', experts.length);
    console.log('Active category:', activeCategory);
    console.log('Search query:', searchQuery);
    console.log('Sample expert data:', experts[0]);
    
    // 'Dirty but Safe' Inclusive Logic - JSON.stringify approach
    const filteredExperts = (!activeCategory || activeCategory === 'all') 
      ? experts 
      : experts.filter(e => JSON.stringify(e).toLowerCase().includes(activeCategory.toLowerCase()));
    
    console.log('After category filter:', filteredExperts.length);
    
    // Apply search filter if needed
    let finalFiltered = filteredExperts;
    if (searchQuery.trim()) {
      finalFiltered = filteredExperts.filter(user => {
        const userName = user.name || '';
        const userBio = user.bio || '';
        
        // Handle real users with skills array
        if (user.skills && Array.isArray(user.skills)) {
          const skillTitles = user.skills.map((skill: any) => skill.title || '').join(' ');
          return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 userBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 skillTitles.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        // Handle mock users with topSkill
        if (user.topSkill) {
          const topSkillTitle = user.topSkill.title || user.topSkill.skill || '';
          return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 userBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 topSkillTitle.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               userBio.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // === FINAL DATA CLEANUP ===
    
    // Identify the 3 new users
    const newUsers = ['dalia helal', 'ahmed nagy', 'aya amgad abdelhamed'];
    
    // De-duplicate Khaled Ibrahim - keep only one instance with most complete profile
    const khaledIbrahimUsers = finalFiltered.filter(user => 
      (user.name || '').toLowerCase().includes('khaled ibrahim')
    );
    
    let khaledIbrahim = null;
    if (khaledIbrahimUsers.length > 0) {
      // Find the most complete profile (has bio, skills, etc.)
      khaledIbrahim = khaledIbrahimUsers.reduce((best, current) => {
        const bestScore = (best.bio ? 1 : 0) + (best.skills && best.skills.length > 0 ? 1 : 0) + (best.avatar_url ? 1 : 0);
        const currentScore = (current.bio ? 1 : 0) + (current.skills && current.skills.length > 0 ? 1 : 0) + (current.avatar_url ? 1 : 0);
        return currentScore > bestScore ? current : best;
      });
      
      // Remove all Khaled Ibrahim users
      finalFiltered = finalFiltered.filter(user => 
        !(user.name || '').toLowerCase().includes('khaled ibrahim')
      );
    }
    
    // Find and position Maryam in the middle
    let maryam = null;
    const maryamIndex = finalFiltered.findIndex(user => 
      (user.name || '').toLowerCase().includes('maryam')
    );
    
    if (maryamIndex !== -1) {
      // Remove Maryam from current position
      maryam = finalFiltered.splice(maryamIndex, 1)[0];
      
      // Set Maryam stats to 0
      maryam.rating = 0;
      maryam.swaps = 0;
    }
    
    // Separate new users from others
    const actualNewUsers = [];
    const otherUsers = [];
    
    finalFiltered.forEach(user => {
      const userName = (user.name || '').toLowerCase();
      if (newUsers.includes(userName)) {
        actualNewUsers.push(user);
      } else {
        otherUsers.push(user);
      }
    });
    
    // Rebuild the array in the correct order:
    // 1. Other users (established)
    // 2. Khaled Ibrahim (priority position)
    // 3. Maryam (middle)
    // 4. More users (remaining)
    // 5. 3 new users (bottom)
    
    let finalArray = [...otherUsers];
    
    // Insert Khaled Ibrahim before the new users (near the end but before new users)
    if (khaledIbrahim) {
      const khaledPosition = Math.max(finalArray.length - 3, 0); // Position before last 3 users
      finalArray.splice(khaledPosition, 0, khaledIbrahim);
    }
    
    // Insert Maryam in the true middle of the entire array
    if (maryam) {
      const middleIndex = Math.floor(finalArray.length / 2);
      finalArray.splice(middleIndex, 0, maryam);
    }
    
    // Add the new users at the very bottom
    finalArray = [...finalArray, ...actualNewUsers];
    
    finalFiltered = finalArray;
    
    console.log('After final cleanup:', finalFiltered.length);
    console.log('Final filtered users sample:', finalFiltered.slice(0, 2));
    console.log('Setting filteredUsers with length:', finalFiltered.length);
    setFilteredUsers(finalFiltered);
  }, [activeCategory, searchQuery, realUsers]);

  const handleCategoryFilter = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSwapRequest = (userName: string) => {
    // toast.success(`Swap request sent to ${userName}!`);
  };

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

  // Helper function to get icon for category
  const getIconForCategory = (category: string) => {
    const categoryIconMap: { [key: string]: any } = {
      'web': Code,
      'mobile': Smartphone,
      'design': Palette,
      'marketing': TrendingUp,
      'languages': Globe,
      'writing': PenTool,
      'music': Music,
      'cooking': ChefHat,
      'prompt': Sparkles,
      'photography': Camera,
      'speaking': Mic,
      'management': Kanban
    };
    return categoryIconMap[category] || Sparkles; // Fallback to Sparkles
  };

  // Helper function to get avatar SVG
  const getAvatarSvg = (type: string) => {
    const avatars: { [key: string]: React.ReactElement } = {
      panda: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#ffffff"/>
          <circle cx="35" cy="40" r="8" fill="#000000"/>
          <circle cx="65" cy="40" r="8" fill="#000000"/>
          <circle cx="35" cy="42" r="3" fill="#ffffff"/>
          <circle cx="65" cy="42" r="3" fill="#ffffff"/>
          <ellipse cx="50" cy="65" rx="8" ry="6" fill="#000000"/>
          <circle cx="25" cy="25" r="12" fill="#000000"/>
          <circle cx="75" cy="25" r="12" fill="#000000"/>
          <circle cx="25" cy="27" r="5" fill="#ffffff"/>
          <circle cx="75" cy="27" r="5" fill="#ffffff"/>
        </svg>
      ),
      cat: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#ff8c42"/>
          <polygon points="30,20 35,35 25,35" fill="#ff8c42"/>
          <polygon points="70,20 75,35 65,35" fill="#ff8c42"/>
          <circle cx="35" cy="45" r="5" fill="#000000"/>
          <circle cx="65" cy="45" r="5" fill="#000000"/>
          <circle cx="37" cy="47" r="2" fill="#ffffff"/>
          <circle cx="67" cy="47" r="2" fill="#ffffff"/>
          <polygon points="50,55 45,65 55,65" fill="#ff6b6b"/>
          <line x1="50" y1="65" x2="50" y2="75" stroke="#ff6b6b" strokeWidth="2"/>
        </svg>
      ),
      robot: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="20" y="30" width="60" height="50" rx="10" fill="#4a90e2"/>
          <rect x="25" y="35" width="20" height="15" rx="5" fill="#ffffff"/>
          <rect x="55" y="35" width="20" height="15" rx="5" fill="#ffffff"/>
          <circle cx="35" cy="42" r="3" fill="#000000"/>
          <circle cx="65" cy="42" r="3" fill="#000000"/>
          <rect x="40" y="60" width="20" height="10" rx="5" fill="#2c5aa0"/>
          <rect x="30" y="75" width="10" height="15" fill="#4a90e2"/>
          <rect x="60" y="75" width="10" height="15" fill="#4a90e2"/>
          <circle cx="35" cy="25" r="5" fill="#ff6b6b"/>
          <circle cx="65" cy="25" r="5" fill="#ff6b6b"/>
        </svg>
      ),
      rabbit: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="55" r="35" fill="#f5f5dc"/>
          <ellipse cx="35" cy="25" rx="8" ry="20" fill="#f5f5dc"/>
          <ellipse cx="65" cy="25" rx="8" ry="20" fill="#f5f5dc"/>
          <ellipse cx="35" cy="28" rx="4" ry="8" fill="#ffb6c1"/>
          <ellipse cx="65" cy="28" rx="4" ry="8" fill="#ffb6c1"/>
          <circle cx="40" cy="50" r="3" fill="#000000"/>
          <circle cx="60" cy="50" r="3" fill="#000000"/>
          <circle cx="42" cy="51" r="1" fill="#ffffff"/>
          <circle cx="62" cy="51" r="1" fill="#ffffff"/>
          <circle cx="50" cy="60" r="2" fill="#ffb6c1"/>
          <circle cx="45" cy="65" r="1" fill="#000000"/>
          <circle cx="55" cy="65" r="1" fill="#000000"/>
        </svg>
      ),
      girl: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#fdbcb4"/>
          <path d="M 20 40 Q 50 20 80 40 Q 80 50 50 60 Q 20 50 20 40" fill="#8b4513"/>
          <circle cx="35" cy="45" r="3" fill="#000000"/>
          <circle cx="65" cy="45" r="3" fill="#000000"/>
          <circle cx="37" cy="46" r="1" fill="#ffffff"/>
          <circle cx="67" cy="46" r="1" fill="#ffffff"/>
          <path d="M 50 55 Q 45 60 40 55" fill="#ff69b4"/>
          <path d="M 50 55 Q 55 60 60 55" fill="#ff69b4"/>
          <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
        </svg>
      ),
      boy: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#fdbcb4"/>
          <path d="M 25 35 Q 50 25 75 35 Q 75 45 50 50 Q 25 45 25 35" fill="#4a4a4a"/>
          <circle cx="35" cy="45" r="3" fill="#000000"/>
          <circle cx="65" cy="45" r="3" fill="#000000"/>
          <circle cx="37" cy="46" r="1" fill="#ffffff"/>
          <circle cx="67" cy="46" r="1" fill="#ffffff"/>
          <rect x="45" y="55" width="10" height="8" rx="4" fill="#4a4a4a"/>
          <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
        </svg>
      ),
      artist: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#ffe4b5"/>
          <path d="M 30 40 Q 50 30 70 40 Q 70 50 50 55 Q 30 50 30 40" fill="#ff69b4"/>
          <circle cx="35" cy="45" r="3" fill="#000000"/>
          <circle cx="65" cy="45" r="3" fill="#000000"/>
          <circle cx="37" cy="46" r="1" fill="#ffffff"/>
          <circle cx="67" cy="46" r="1" fill="#ffffff"/>
          <path d="M 50 55 Q 45 58 40 55" fill="#ff69b4"/>
          <path d="M 50 55 Q 55 58 60 55" fill="#ff69b4"/>
          <circle cx="50" cy="63" r="2" fill="#ff69b4"/>
          <circle cx="25" cy="25" r="3" fill="#ffd700"/>
        </svg>
      ),
      scientist: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#e6e6fa"/>
          <circle cx="50" cy="35" r="20" fill="#4169e1"/>
          <rect x="30" y="30" width="40" height="10" fill="#4169e1"/>
          <circle cx="35" cy="45" r="3" fill="#000000"/>
          <circle cx="65" cy="45" r="3" fill="#000000"/>
          <circle cx="37" cy="46" r="1" fill="#ffffff"/>
          <circle cx="67" cy="46" r="1" fill="#ffffff"/>
          <rect x="45" y="55" width="10" height="8" rx="4" fill="#4169e1"/>
          <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
        </svg>
      )
    };
    return avatars[type] || avatars.panda;
  };

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-6">
      {/* Hero Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
          Discover your next skill swap
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          Connect with talented individuals and exchange expertise in a premium marketplace for skills
        </p>
        
        {/* Glassmorphism Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search for specific skills or users..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/70 backdrop-blur-xl transition-all"
          />
        </div>
        
        {/* Manual Refresh Button for HMR Issues */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white text-sm hover:bg-slate-600/50 transition-all flex items-center gap-2"
            title="Force refresh page if Vite hangs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Page
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-6 bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-slate-700 rounded animate-pulse w-24" />
                </div>
              </div>
              <div className="h-4 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-32" />
              <div className="h-10 bg-slate-700 rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      )}
      
      {/* Skills Category Filter */}
      <div className="mb-12 md:mb-16">
        <div className="skills-filter-container">
          {SKILL_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => {
                console.log('=== CATEGORY BUTTON CLICK ===');
                console.log('Clicked category:', category.id, category.name);
                handleCategoryFilter(category.id);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 border-purple-400 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/5 border-white/20 text-slate-400 hover:border-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl font-semibold text-white">
            {filteredUsers.length} Expert{filteredUsers.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-slate-400">
            {activeCategory !== 'all' && (
              <span>Filtered by: <span className="text-white font-medium">{SKILL_CATEGORIES.find(cat => cat.id === activeCategory)?.name}</span></span>
            )}
          </div>
        </div>

        {/* User Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {filteredUsers.map((user, index) => {
              // BULLETPROOF: Find display skill with multiple fallbacks
              let displaySkill = null;
              let skillDisplayMode = 'none'; // 'formal', 'string', 'none'
              
              // Try to find matching skill for selected category
              if (activeCategory !== 'all' && user.skills?.length > 0) {
                const matchingSkill = user.skills.find((skill: any) => {
                  if (typeof skill === 'object' && skill.category) {
                    return skill.category.toLowerCase() === activeCategory.toLowerCase();
                  }
                  if (typeof skill === 'string') {
                    const skillCategoryMap: { [key: string]: string } = {
                      'React': 'web', 'TypeScript': 'web', 'Node.js': 'web', 'Vue.js': 'web', 'Python': 'web', 'Django': 'web',
                      'Machine Learning': 'web', 'Data Analysis': 'web', 'Modern Arabic': 'languages', 'Classical Arabic': 'languages',
                      'Egyptian Dialect': 'languages', 'Business English': 'languages', 'IELTS Prep': 'languages',
                      'iOS': 'mobile', 'Android': 'mobile', 'React Native': 'mobile', 'Figma': 'design', 'Adobe XD': 'design',
                      'Prototyping': 'design', 'Portrait': 'photography', 'Landscape': 'photography', 'Event Photography': 'photography',
                      'Presentation Skills': 'speaking', 'Debate Coaching': 'speaking', 'Corporate Training': 'speaking',
                      'Agile': 'management', 'Scrum': 'management', 'Team Leadership': 'management',
                      'Egyptian Cuisine': 'cooking', 'Levantine Dishes': 'cooking', 'Desserts': 'cooking',
                      'SEO': 'marketing', 'Social Media': 'marketing', 'Content Strategy': 'marketing',
                      'Instagram': 'marketing', 'Facebook': 'marketing', 'Beat Making': 'music', 'Audio Engineering': 'music',
                      'MIDI Production': 'music', 'Documentation': 'writing', 'API Writing': 'writing',
                      'Content Creation': 'writing', 'Blog Writing': 'writing', 'Copywriting': 'writing',
                      'SEO Content': 'writing', 'ChatGPT': 'prompt', 'Automation': 'prompt', 'AI Strategy': 'prompt',
                      'AI Prompts': 'prompt', 'Midjourney': 'prompt'
                    };
                    return skillCategoryMap[skill] === activeCategory;
                  }
                  return false;
                });
                
                if (matchingSkill) {
                  displaySkill = typeof matchingSkill === 'object' ? matchingSkill : { title: matchingSkill, category: activeCategory };
                  skillDisplayMode = typeof matchingSkill === 'object' ? 'formal' : 'string';
                }
              }
              
              // Fallback to topSkill if no match found
              if (!displaySkill && user.topSkill) {
                displaySkill = user.topSkill;
                skillDisplayMode = 'formal';
              }
              
              // Fallback to first skill if no topSkill
              if (!displaySkill && user.skills?.length > 0) {
                const firstSkill = user.skills[0];
                if (typeof firstSkill === 'object') {
                  displaySkill = firstSkill;
                  skillDisplayMode = 'formal';
                } else {
                  displaySkill = { title: firstSkill, category: 'general' };
                  skillDisplayMode = 'string';
                }
              }
              
              // Ensure displaySkill has proper icon
              if (displaySkill && typeof displaySkill === 'object' && !displaySkill.icon) {
                displaySkill = {
                  ...displaySkill,
                  icon: getIconForCategory(displaySkill.category || 'web')
                };
              }
              
              // ZERO EXCLUSION: Always render the card, regardless of skill state
              return (
              <motion.div
                key={user.id || `expert-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-card p-4 md:p-6 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105"
              >
                {/* User Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {(user as any).avatar_url ? (
                      <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                        <img 
                          src={(user as any).avatar_url} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-initials')) {
                              const fallback = document.createElement('div');
                              const avatarColor = getAvatarColor(String(user.id || ''), user.name || '');
                              fallback.className = 'fallback-initials absolute inset-0 flex items-center justify-center rounded-full';
                              fallback.style.backgroundColor = avatarColor;
                              fallback.innerHTML = `<span class="text-white font-bold text-lg">${user.initials || (user.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>`;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                    ) : user.useAvatar ? (
                      <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                        {getAvatarSvg((user as any).avatarType)}
                      </div>
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex items-center justify-center"
                        style={{ backgroundColor: getAvatarColor(String(user.id || ''), user.name || '') }}
                      >
                        <span className="text-white font-bold text-lg">{user.initials || (user.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-1 truncate">{user.name || 'Unknown User'}</h3>
                    <div className="flex items-center gap-1 text-sm md:text-base text-slate-400 flex-wrap">
                      {(() => {
                        const specificNewUsers = ['dalia helal', 'ahmed nagy', 'aya amgad abdelhamed'];
                        const isSpecificUser = specificNewUsers.includes((user.full_name || '').toLowerCase());
                        
                        return user.rating > 0 ? (
                          <span> {user.rating.toFixed(1)}</span>
                        ) : isSpecificUser ? (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">New</span>
                        ) : null;
                      })()}
                      <span> </span>
                      <span>{user.swaps || 0} swaps</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed line-clamp-3">{user.bio || 'No bio available'}</p>
                </div>

                {/* Top Skill - BULLETPROOF DISPLAY */}
                <div className="mb-4">
                  {displaySkill && typeof displaySkill === 'object' ? (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                        {displaySkill.icon && <displaySkill.icon className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm md:text-base truncate">{displaySkill.title}</h4>
                        <p className="text-xs md:text-sm text-slate-500 capitalize truncate">{displaySkill.category}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm md:text-base truncate">Ready to Swap</h4>
                        <p className="text-xs md:text-sm text-slate-500 capitalize truncate">New Member</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Skills - FLEXIBLE DISPLAY */}
                  {user.skills && Array.isArray(user.skills) && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.skills
                        .slice(0, 3)
                        .map((skill: any, skillIndex: number) => (
                          <span key={skill.id || skillIndex} className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300">
                            {typeof skill === 'string' ? skill : skill?.title || 'Skill'}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {currentUser && (user as any).id === currentUser.id ? (
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg min-h-[48px] md:min-h-[52px]"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/profile/${(user as any).id}`)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg min-h-[48px] md:min-h-[52px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Request Swap</span>
                  </button>
                )}
              </motion.div>
            )})}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 glass-card"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {activeCategory !== 'all' 
                ? `No experts found in ${SKILL_CATEGORIES.find(cat => cat.id === activeCategory)?.name || 'this category'}`
                : 'No experts found'
              }
            </h3>
            <p className="text-slate-400 mb-6">
              {activeCategory !== 'all' 
                ? 'Try selecting a different category or clearing filters'
                : 'Try adjusting your filters or search terms'
              }
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setFilteredUsers(realUsers);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
