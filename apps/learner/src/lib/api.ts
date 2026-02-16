import axios from 'axios';
import type { Lesson, Learner, Payment } from '@acme/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('learner_token');
    console.log('API Request:', config.url, 'Token:', token ? 'present' : 'missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Log responses for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Learner auth API (magic link)
export const authApi = {
  // Request magic link
  requestMagicLink: async (email: string) => {
    const response = await api.post('/auth/magic-link', { email });
    return response.data;
  },

  // Verify magic link token
  verifyMagicLink: async (token: string) => {
    const response = await api.post('/auth/verify-magic-link', { token });
    console.log('akika:', response)
    return response.data as {
      access_token: string;
      learner: Learner;
      confirmedBooking?: {
        id: string;
        date: string;
        instructorName?: string;
      };
    };
  },

  // Get current learner
  me: async () => {
    const response = await api.get('/auth/learner/me');
    return response.data as Learner;
  },

  // Update learner profile
  updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
    const response = await api.put('/auth/learner/me', data);
    return response.data as Learner;
  },
};

// Learner lessons API
export const lessonsApi = {
  // Get learner's lessons
  getMyLessons: async (params?: { status?: string }) => {
    const response = await api.get('/learners/me/lessons', { params });
    console.log('Lessons response:', response);
    return response.data as Lesson[];
  },

  // Get next upcoming lesson
  getNextLesson: async () => {
    const response = await api.get('/learners/me/lessons', {
      params: { status: 'scheduled', limit: 1 },
    });
    const lessons = response.data as Lesson[];
    return lessons[0] || null;
  },

  // Preview cancellation fee before cancelling
  previewCancellationFee: async (lessonId: string) => {
    const response = await api.get(`/learners/me/lessons/${lessonId}/cancel-preview`);
    return response.data as {
      lessonId: string;
      lessonPrice: number;
      paymentStatus: string;
      fee: number;
      refundAmount: number;
      chargePercent: number;
      hoursUntilLesson: number;
      tier: 'free' | 'late' | 'very-late';
      currentBalance: number;
      balanceAfterCancel: number;
      policyText?: string;
      allowLearnerCancellation: boolean;
    };
  },

  // Cancel a lesson
  cancelLesson: async (lessonId: string, reason?: string) => {
    const response = await api.post(`/learners/me/lessons/${lessonId}/cancel`, { reason });
    return response.data as Lesson;
  },
};

// Payments API
export const paymentsApi = {
  // Get payment history
  getHistory: async () => {
    const response = await api.get('/learners/me/payments');
    return response.data as Payment[];
  },

  // Create payment intent for balance
  createPaymentIntent: async (amount: number) => {
    const response = await api.post('/payments/create-intent', { amount });
    return response.data as { clientSecret: string; paymentIntentId: string };
  },

  // Confirm payment status (checks with Stripe and updates DB)
  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post(`/payments/confirm/${paymentIntentId}`);
    return response.data as Payment;
  },
};

export default api;
