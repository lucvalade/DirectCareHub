"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  registerCustomUser: (profile: UserProfile) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => void;
  signInWithProvider: (provider: "google" | "facebook") => Promise<void>;
  signOut: () => Promise<void>;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  employer: {
    uid: "emp_ontario_01",
    email: "luc.valade@directfunding.ca",
    displayName: "Luc Valade",
    role: "employer",
    hourlyRate: 23.50,
    phone: "416-555-0192",
    emergencyContact: "Sarah Miller (Sister) - 416-555-0199"
  },
  attendant: {
    uid: "psw_elena_02",
    email: "elena.rostova@care.ca",
    displayName: "Elena Rostova (Lead PSW)",
    role: "attendant",
    hourlyRate: 23.50,
    phone: "647-555-0144"
  },
  bookkeeper: {
    uid: "bk_marcus_03",
    email: "marcus.accounting@dfservices.ca",
    displayName: "Marcus Vance, CPA (DF Bookkeeper)",
    role: "bookkeeper"
  }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  signInWithEmail: async () => {},
  registerCustomUser: async () => {},
  loginAsDemoUser: () => {},
  signInWithProvider: async () => {},
  signOut: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("directcare_active_user");
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Failed to parse saved session:", e);
        }
      }
    }
  }, []);

  const loginAsDemoUser = (role: UserRole) => {
    const profile = DEMO_USERS[role] || DEMO_USERS.employer;
    setUserProfile(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("directcare_active_user", JSON.stringify(profile));
    }
  };

  const signInWithEmail = async (email: string) => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`directcare_profile_${email.toLowerCase()}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setUserProfile(parsed);
              localStorage.setItem("directcare_active_user", JSON.stringify(parsed));
              setLoading(false);
              resolve();
              return;
            } catch (e) {
              console.error("Failed to parse saved profile:", e);
            }
          }

          // Check if matches a demo user
          const matchedDemo = Object.values(DEMO_USERS).find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          );
          if (matchedDemo) {
            setUserProfile(matchedDemo);
            localStorage.setItem("directcare_active_user", JSON.stringify(matchedDemo));
            setLoading(false);
            resolve();
            return;
          }

          // Auto-generate profile for new email address seamlessly
          const namePart = email.includes("@") ? email.split("@")[0] : email;
          const formattedName = namePart.replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const newProfile: UserProfile = {
            uid: `usr_${Math.random().toString(36).substr(2, 9)}`,
            email: email,
            displayName: formattedName || "Direct Funding Employer",
            role: "employer",
            hourlyRate: 23.50,
            phone: "416-555-0100",
            emergencyContact: "Primary Account"
          };

          localStorage.setItem(`directcare_profile_${email.toLowerCase()}`, JSON.stringify(newProfile));
          localStorage.setItem("directcare_active_user", JSON.stringify(newProfile));
          setUserProfile(newProfile);
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          resolve();
        }
      }, 400);
    });
  };

  const registerCustomUser = async (profile: UserProfile) => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem(`directcare_profile_${profile.email}`, JSON.stringify(profile));
          localStorage.setItem("directcare_active_user", JSON.stringify(profile));
        }
        setUserProfile(profile);
        setLoading(false);
        resolve();
      }, 700);
    });
  };

  const signInWithProvider = async (provider: "google" | "facebook") => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockProfile: UserProfile = {
          uid: `${provider}_user_${Math.random().toString(36).substr(2, 9)}`,
          email: `lucgvalade@gmail.com`,
          displayName: "Luc Valade",
          role: "employer",
          phone: "416-555-0101",
          hourlyRate: 23.50,
          emergencyContact: "System Admin"
        };
        // Persist it
        if (typeof window !== "undefined") {
          localStorage.setItem(`directcare_profile_lucgvalade@gmail.com`, JSON.stringify(mockProfile));
          localStorage.setItem("directcare_active_user", JSON.stringify(mockProfile));
        }
        setUserProfile(mockProfile);
        setLoading(false);
        resolve();
      }, 600);
    });
  };

  const signOut = async () => {
    setUserProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("directcare_active_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userProfile ? { uid: userProfile.uid, email: userProfile.email } : null,
        userProfile,
        loading,
        signInWithEmail,
        registerCustomUser,
        loginAsDemoUser,
        signInWithProvider,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
