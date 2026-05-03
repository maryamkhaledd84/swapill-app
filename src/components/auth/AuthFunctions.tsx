import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

// Sign Up function (إنشاء حساب جديد)
export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    console.log('Starting sign up process...');
    console.log('Sending name to Supabase:', fullName); // Console Log: Verify name before signup call
    console.log('Signup data being sent:', { email, fullName }); // Debug: Check if fullName is received
    
    const authData = {
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Ensure this variable is NOT empty
          display_name: fullName 
        }
      }
    };
    
    console.log('=== SIGNUP VERIFICATION ===');
    console.log('Exact object being sent to auth.signUp:', JSON.stringify(authData, null, 2));
    console.log('Full name value:', fullName);
    console.log('Full name type:', typeof fullName);
    console.log('Full name length:', fullName?.length);
    console.log('=== END SIGNUP VERIFICATION ===');
    console.log('FINAL CHECK - Name to be sent:', fullName); // Capture Verification
    
    const { data, error } = await supabase.auth.signUp(authData);
    
    if (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      return { success: false, error: error.message };
    }
    
    console.log('Sign up successful:', data);
    console.log('Signup Metadata:', data.user?.user_metadata); // Verification: Check if name was sent
    
    // Zero-Null Fallback: Force name into profiles table if trigger failed
    if (data.user && fullName) {
      console.log('=== ZERO-NULL FALLBACK ===');
      console.log('Forcing name into profiles table...');
      
      try {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            full_name: fullName,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error('Fallback upsert failed:', upsertError);
        } else {
          console.log('✅ Fallback successful: Name forced into profiles table');
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
      
      console.log('=== END ZERO-NULL FALLBACK ===');
    }
    
    toast.success('Account created successfully!');
    return { success: true, data };
    
  } catch (error) {
    console.error('Unexpected sign up error:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error: 'Unexpected error' };
  }
};

// Login function (تسجيل دخول)
export const signIn = async (email: string, password: string) => {
  try {
    console.log('Starting sign in process...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('=== LOGIN ERROR DETAILS ===');
      console.error('Error Code:', error.status);
      console.error('Error Message:', error.message);
      console.error('Full Error Object:', error);
      console.error('Email attempted:', email);
      console.error('=== END LOGIN ERROR ===');
      toast.error(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    }
    
    console.log('Sign in successful:', data);
    toast.success('Welcome back!');
    return { success: true, data };
    
  } catch (error) {
    console.error('Unexpected sign in error:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error: 'Unexpected error' };
  }
};

// Sign Out function
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      return { success: false, error: error.message };
    }
    
    toast.success('Signed out successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error: 'Unexpected error' };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message, user: null };
    }
    
    return { success: true, user };
    
  } catch (error) {
    console.error('Unexpected get user error:', error);
    return { success: false, error: 'Unexpected error', user: null };
  }
};
