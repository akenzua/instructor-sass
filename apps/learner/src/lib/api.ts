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

  // Complete profile with licence verification
  completeProfile: async (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    provisionalLicenceNumber: string;
    phone?: string;
    testDate?: string;
  }) => {
    const response = await api.post('/auth/learner/complete-profile', data);
    return response.data as {
      success: boolean;
      error?: string;
      field?: string;
      learner?: Learner;
      licenceStatus?: string;
    };
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

  // Get receipt download URL (opens in new tab with auth)
  getReceiptUrl: (paymentId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('learner_token') : null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/learners/me/payments/${paymentId}/receipt?token=${token || ''}`;
  },

  // Download receipt HTML as blob
  downloadReceipt: async (paymentId: string) => {
    const response = await api.get(`/learners/me/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Create payment intent for balance
  createPaymentIntent: async (amount: number, instructorId?: string) => {
    const response = await api.post('/payments/create-intent', { amount, instructorId });
    return response.data as { clientSecret: string; paymentIntentId: string };
  },

  // Confirm payment status (checks with Stripe and updates DB)
  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post(`/payments/confirm/${paymentIntentId}`);
    return response.data as Payment;
  },
};

// Booking API
export const bookingApi = {
  // Get all instructors the learner is linked to
  getMyInstructors: async () => {
    const response = await api.get('/learners/me/booking/instructors');
    return response.data as {
      instructors: Array<{
        instructorId: string;
        instructor: {
          _id: string;
          firstName: string;
          lastName: string;
          profileImage?: string;
        };
        balance: number;
        totalLessons: number;
        completedLessons: number;
        status: string;
      }>;
      primaryInstructorId: string | null;
    };
  },

  // Get instructor info, availability schedule, lesson types, pricing
  getInstructorAvailability: async (instructorId?: string) => {
    const params = instructorId ? { instructorId } : {};
    const response = await api.get('/learners/me/booking/availability', { params });
    return response.data as {
      instructor: {
        _id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
        bio?: string;
        hourlyRate: number;
        lessonTypes: Array<{
          type: string;
          price: number;
          duration: number;
          description?: string;
        }>;
        vehicleInfo?: {
          make?: string;
          model?: string;
          year?: number;
          transmission?: string;
        };
        serviceAreas?: Array<{
          name: string;
          postcode?: string;
          radiusMiles?: number;
        }>;
        currency: string;
        cancellationPolicy?: {
          freeCancellationWindowHours: number;
          lateCancellationWindowHours: number;
          lateCancellationChargePercent: number;
          policyText?: string;
          allowLearnerCancellation: boolean;
        };
        acceptingNewStudents?: boolean;
        languages?: string[];
        username?: string;
      } | null;
      weeklyAvailability: Array<{
        dayOfWeek: string;
        slots: Array<{ start: string; end: string }>;
        isAvailable: boolean;
      }>;
      unscheduledLessons: number;
      balance: number;
      needsInstructor: boolean;
      allInstructors: Array<{
        instructorId: string;
        name: string;
        profileImage?: string;
        balance: number;
        totalLessons: number;
      }>;
    };
  },

  // Switch the primary instructor
  switchInstructor: async (instructorId: string) => {
    const response = await api.post('/learners/me/booking/switch-instructor', {
      instructorId,
    });
    return response.data;
  },

  // Link to a new instructor
  linkInstructor: async (instructorId: string) => {
    const response = await api.post('/learners/me/booking/link-instructor', {
      instructorId,
    });
    return response.data as {
      linkId: string;
      instructorId: string;
      balance: number;
      status: string;
    };
  },

  // Get packages available from instructor
  getPackages: async (instructorId?: string) => {
    const params = instructorId ? { instructorId } : {};
    const response = await api.get('/learners/me/booking/packages', { params });
    return response.data as Array<{
      _id: string;
      name: string;
      description?: string;
      lessonCount: number;
      price: number;
      discountPercent: number;
      isActive: boolean;
    }>;
  },

  // Book a single lesson (deducts from link balance)
  bookLesson: async (data: {
    startTime: string;
    duration: number;
    type?: string;
    instructorId?: string;
    pickupLocation?: string;
    notes?: string;
  }) => {
    const response = await api.post('/learners/me/booking/lesson', data);
    return response.data as {
      lesson: any;
      newBalance: number;
    };
  },

  // Book a package (deducts from link balance)
  bookPackage: async (data: { packageId: string; notes?: string }) => {
    const response = await api.post('/learners/me/booking/package', data);
    return response.data as {
      package: { _id: string; name: string; lessonCount: number; price: number };
      lessons: Array<{ _id: string }>;
      newBalance: number;
    };
  },
};

// Public search API (no auth needed)
export const searchApi = {
  // Search for instructors by location and filters
  searchInstructors: async (params: {
    postcode?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    transmission?: string;
    lessonType?: string;
    maxPrice?: number;
    language?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/search/instructors', { params });
    return response.data;
  },

  // Get instructor public profile
  getInstructorProfile: async (usernameOrId: string) => {
    const response = await api.get(`/search/instructors/${usernameOrId}`);
    return response.data;
  },

  // Resolve a UK postcode to coordinates
  resolvePostcode: async (postcode: string) => {
    const response = await api.get(`/search/postcode/${postcode}`);
    return response.data as { latitude: number; longitude: number; postcode: string };
  },
};

// Calendar API
export const calendarApi = {
  // Get the subscribable calendar feed URL
  getFeedUrl: async () => {
    const response = await api.get('/calendar/feed-url');
    return response.data as {
      feedToken: string;
      httpUrl: string;
      webcalUrl: string;
      googleCalendarUrl: string;
    };
  },

  // Regenerate calendar feed token (invalidates old URLs)
  regenerateToken: async () => {
    const response = await api.post('/calendar/regenerate-token');
    return response.data as {
      feedToken: string;
      httpUrl: string;
      webcalUrl: string;
      googleCalendarUrl: string;
    };
  },

  // Get the download URL for a single lesson .ics file
  getLessonIcsUrl: (lessonId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/calendar/lesson/${lessonId}.ics`;
  },

  // Get the download URL for the test date .ics file
  getTestDateIcsUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/calendar/test-date.ics`;
  },

  // Download a lesson .ics file (with auth)
  downloadLessonIcs: async (lessonId: string) => {
    const response = await api.get(`/calendar/lesson/${lessonId}.ics`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-${lessonId}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Download the test date .ics file (with auth)
  downloadTestDateIcs: async () => {
    const response = await api.get('/calendar/test-date.ics', {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'driving-test-date.ics';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
