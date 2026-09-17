'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, role?: UserRole) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  employer: {
    uid: 'emp_ontario_01',
    email: 'luc.valade@directfunding.ca',
    displayName: 'Luc Valade (Employer)',
    role: 'employer',
    hourlyRate: 23.50,
    phone: '416-555-0192',
    emergencyContact: 'Sarah Miller (Sister) - 416-555-0199'
  },
  attendant: {
    uid: 'psw_elena_02',
    email: 'elena.rostova@care.ca',
    displayName: 'Elena Rostova (Lead PSW)',
    role: 'attendant',
    hourlyRate: 23.50,
    phone: '647-555-0144'
  },
  bookkeeper: {
    uid: 'bk_marcus_03',
    email: 'marcus.accounting@dfservices.ca',
    displayName: 'Marcus Vance, CPA (DF Bookkeeper)',
    role: 'bookkeeper'
  }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: DEMO_USERS.employer,
  loading: false,
  signInWithEmail: async () => {},
  loginAsDemoUser: () => {},
  signOut: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEMO_USERS.employer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load persisted demo role preference
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('directcare_role') as UserRole;
      if (savedRole && DEMO_USERS[savedRole]) {
        setUserProfile(DEMO_USERS[savedRole]);
      }
    }
  }, []);

  const loginAsDemoUser = (role: UserRole) => {
    const profile = DEMO_USERS[role] || DEMO_USERS.employer;
    setUserProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('directcare_role', role);
    }
  };

  const signInWithEmail = async (email: string, role: UserRole = 'employer') => {
    setLoading(true);
    setTimeout(() => {
      loginAsDemoUser(role);
      setLoading(false);
    }, 300);
  };

  const signOut = async () => {
    setUserProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('directcare_role');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userProfile ? { uid: userProfile.uid, email: userProfile.email } : null,
        userProfile,
        loading,
        signInWithEmail,
        loginAsDemoUser,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
