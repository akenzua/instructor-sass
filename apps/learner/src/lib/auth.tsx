'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from './api';
import type { Learner } from '@acme/shared';

interface AuthContextValue {
  learner: Learner | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verifyMagicLink: (token: string) => Promise<{
    confirmedBooking?: {
      id: string;
      date: string;
      instructorName?: string;
    };
  }>;
  refreshLearner: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function LearnerAuthProvider({ children }: AuthProviderProps) {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const initAuth = async () => {
      const token = localStorage.getItem('learner_token');
      console.log('Auth init - token exists:', !!token);
      if (token) {
        try {
          const learnerData = await authApi.me();
          console.log('Auth init - learner loaded:', learnerData);
          setLearner(learnerData);
        } catch (error) {
          // Token invalid, clear it
          console.error('Auth init - error loading learner:', error);
          localStorage.removeItem('learner_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  if (!isMounted) {
    return null;
  }

  const verifyMagicLink = async (token: string) => {
    const { access_token, learner: learnerData, confirmedBooking } = await authApi.verifyMagicLink(token);
    localStorage.setItem('learner_token', access_token);
    setLearner(learnerData);
    return { confirmedBooking };
  };

  const refreshLearner = async () => {
    try {
      const learnerData = await authApi.me();
      setLearner(learnerData);
    } catch (error) {
      console.error('Failed to refresh learner:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('learner_token');
    setLearner(null);
  };

  return (
    <AuthContext.Provider
      value={{
        learner,
        isLoading,
        isAuthenticated: !!learner,
        verifyMagicLink,
        refreshLearner,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useLearnerAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useLearnerAuth must be used within a LearnerAuthProvider');
  }
  return context;
}
