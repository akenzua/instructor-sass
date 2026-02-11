import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Package } from '@acme/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for public instructor data
export interface PublicInstructor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  about?: string;
  profileImage?: string;
  coverImage?: string;
  serviceAreas: string[];
  hourlyRate?: number;
  acceptingNewStudents?: boolean;
  isVerified?: boolean;
  location?: {
    city?: string;
    postcode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  lessonTypes: {
    type: string;
    price: number;
    duration: number;
    description?: string;
  }[];
  passRate?: number;
  totalStudentsPassed?: number;
  yearsExperience?: number;
  qualifications?: string[];
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    transmission: 'manual' | 'automatic' | 'both';
    hasLearnerDualControls?: boolean;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface PublicReview {
  _id: string;
  learnerName: string;
  rating: number;
  comment: string;
  passedTest: boolean;
  createdAt: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  dayOfWeek: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
}

// Search types
export interface SearchInstructorsParams {
  query?: string;
  location?: string;
  radius?: number; // Search radius in miles (default: 10)
  lat?: number; // Latitude for geo search
  lng?: number; // Longitude for geo search
  transmission?: 'manual' | 'automatic' | 'both';
  minRating?: number;
  maxPrice?: number;
  minPassRate?: number;
  minExperience?: number;
  acceptingStudents?: boolean;
  specializations?: string;
  languages?: string;
  sortBy?: 'rating' | 'price' | 'experience' | 'passRate' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InstructorStats {
  totalLessons: number;
  completedLessons: number;
  totalStudents: number;
  averageRating?: number;
}

export interface SearchInstructor extends PublicInstructor {
  stats?: InstructorStats;
  specializations?: string[];
  languages?: string[];
  businessName?: string;
  totalStudentsTaught?: number;
  primaryLocation?: string;
  distance?: number; // Distance in miles (only for geo search)
}

export interface SearchInstructorsResponse {
  instructors: SearchInstructor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search?: {
    type: 'geo' | 'text';
    location?: string;
    radiusMiles?: number;
    coordinates?: { lat: number; lng: number };
    query?: string | null;
  };
}

// Public API endpoints (no auth required)
export const publicApi = {
  // Get instructor by username
  getInstructorByUsername: async (username: string): Promise<PublicInstructor | null> => {
    try {
      const response = await api.get(`/public/instructors/${username}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get instructor's weekly availability
  getInstructorAvailability: async (username: string): Promise<DayAvailability[]> => {
    const response = await api.get(`/public/instructors/${username}/availability`);
    return response.data;
  },

  // Get available booking slots for a date range
  getAvailableSlots: async (
    username: string,
    params: { from: string; to: string; duration?: number }
  ): Promise<AvailableSlot[]> => {
    const response = await api.get(`/public/instructors/${username}/slots`, { params });
    return response.data;
  },

  // Get instructor's packages
  getInstructorPackages: async (username: string): Promise<Package[]> => {
    const response = await api.get(`/public/instructors/${username}/packages`);
    return response.data;
  },

  // Get instructor's reviews
  getInstructorReviews: async (
    username: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ items: PublicReview[]; total: number }> => {
    const response = await api.get(`/public/instructors/${username}/reviews`, { params });
    return response.data;
  },

  // Create a booking (returns payment intent for payment at booking)
  createBooking: async (
    username: string,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      learnerEmail: string;
      learnerFirstName: string;
      learnerLastName: string;
      learnerPhone?: string;
      pickupLocation?: string;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    bookingId: string;
    paymentId: string;
    clientSecret: string;
    paymentIntentId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    currency: string;
    instructorName: string;
    requiresPayment: boolean;
  }> => {
    const response = await api.post(`/public/instructors/${username}/book`, data);
    return response.data;
  },

  // Confirm booking after successful payment
  confirmBookingPayment: async (paymentIntentId: string): Promise<{
    success: boolean;
    message: string;
    bookingId: string;
    lessonDate?: string;
    instructorName?: string;
    alreadyProcessed?: boolean;
  }> => {
    const response = await api.post('/public/bookings/confirm-payment', { paymentIntentId });
    return response.data;
  },

  // Purchase a package
  purchasePackage: async (
    username: string,
    data: {
      packageId: string;
      learnerEmail: string;
      learnerFirstName: string;
      learnerLastName: string;
      learnerPhone?: string;
    }
  ): Promise<{ orderId: string; paymentUrl: string }> => {
    const response = await api.post(`/public/instructors/${username}/packages/purchase`, data);
    return response.data;
  },

  // Search instructors
  searchInstructors: async (
    params: SearchInstructorsParams
  ): Promise<SearchInstructorsResponse> => {
    const response = await api.get('/public/instructors/search', { params });
    return response.data;
  },
};

// React Query Hooks
export function useInstructorByUsername(username: string) {
  return useQuery({
    queryKey: ['instructor', username],
    queryFn: () => publicApi.getInstructorByUsername(username),
    enabled: !!username,
  });
}

export function useInstructorAvailability(username: string) {
  return useQuery({
    queryKey: ['instructor-availability', username],
    queryFn: () => publicApi.getInstructorAvailability(username),
    enabled: !!username,
  });
}

export function useAvailableSlots(
  username: string,
  params: { from: string; to: string; duration?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['available-slots', username, params],
    queryFn: () => publicApi.getAvailableSlots(username, params),
    enabled:
      options?.enabled !== undefined ? options.enabled : !!username && !!params.from && !!params.to,
  });
}

export function useInstructorPackages(username: string) {
  return useQuery({
    queryKey: ['instructor-packages', username],
    queryFn: () => publicApi.getInstructorPackages(username),
    enabled: !!username,
  });
}

export function useInstructorReviews(username: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['instructor-reviews', username, params],
    queryFn: () => publicApi.getInstructorReviews(username, params),
    enabled: !!username,
  });
}

export function useCreateBooking(username: string) {
  return useMutation({
    mutationFn: (data: {
      date: string;
      startTime: string;
      endTime: string;
      learnerEmail: string;
      learnerFirstName: string;
      learnerLastName: string;
      learnerPhone?: string;
      pickupLocation?: string;
      notes?: string;
    }) => publicApi.createBooking(username, data),
  });
}

export function useConfirmBookingPayment() {
  return useMutation({
    mutationFn: (paymentIntentId: string) => publicApi.confirmBookingPayment(paymentIntentId),
  });
}

export function usePurchasePackage(username: string) {
  return useMutation({
    mutationFn: (data: {
      packageId: string;
      learnerEmail: string;
      learnerFirstName: string;
      learnerLastName: string;
      learnerPhone?: string;
    }) => publicApi.purchasePackage(username, data),
  });
}

export function useSearchInstructors(params: SearchInstructorsParams) {
  return useQuery({
    queryKey: ['search-instructors', params],
    queryFn: () => publicApi.searchInstructors(params),
  });
}

// Server-side fetch functions for SSR/ISR
export async function fetchInstructorByUsername(
  username: string
): Promise<PublicInstructor | null> {
  try {
    const response = await fetch(`${API_URL}/public/instructors/${username}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch instructor');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return null;
  }
}

export async function fetchInstructorAvailability(username: string): Promise<DayAvailability[]> {
  try {
    const response = await fetch(`${API_URL}/public/instructors/${username}/availability`, {
      cache: 'no-store', // Disable caching to always get fresh data
    });
    if (!response.ok) {
      console.error('Availability fetch failed:', response.status);
      return [];
    }
    const data = await response.json();
    console.log('Availability API response:', JSON.stringify(data));
    // API returns { weeklySchedule: [...] }, extract the array
    const availability = data.weeklySchedule || data || [];
    console.log('Parsed availability:', availability.length, 'days');
    return availability;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
}

export async function fetchInstructorPackages(username: string): Promise<Package[]> {
  try {
    const url = `${API_URL}/public/instructors/${username}/packages`;
    console.log('Fetching packages from:', url);
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    console.log('Packages response status:', response.status);
    if (!response.ok) {
      console.error('Failed to fetch packages:', response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    console.log('Packages data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

export async function fetchInstructorReviews(
  username: string,
  limit = 10
): Promise<{ items: PublicReview[]; total: number }> {
  try {
    const response = await fetch(
      `${API_URL}/public/instructors/${username}/reviews?limit=${limit}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return { items: [], total: 0 };
    return response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { items: [], total: 0 };
  }
}
