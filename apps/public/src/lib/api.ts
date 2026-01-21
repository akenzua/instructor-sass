import axios from "axios";
import type { Instructor, Learner, Lesson, Package } from "@acme/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
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
    transmission: "manual" | "automatic";
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

  // Create a booking (guest or authenticated learner)
  createBooking: async (
    username: string,
    data: {
      date: string;
      startTime: string;
      duration: number;
      lessonType: string;
      learnerEmail: string;
      learnerFirstName: string;
      learnerLastName: string;
      learnerPhone?: string;
      pickupLocation?: string;
      notes?: string;
    }
  ): Promise<{ bookingId: string; paymentUrl: string }> => {
    const response = await api.post(`/public/instructors/${username}/book`, data);
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
  searchInstructors: async (params: {
    location?: string;
    postcode?: string;
    transmission?: "manual" | "automatic";
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: PublicInstructor[]; total: number }> => {
    const response = await api.get("/public/instructors", { params });
    return response.data;
  },
};

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
      throw new Error("Failed to fetch instructor");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return null;
  }
}

export async function fetchInstructorAvailability(
  username: string
): Promise<DayAvailability[]> {
  try {
    const response = await fetch(`${API_URL}/public/instructors/${username}/availability`, {
      cache: 'no-store', // Disable caching to always get fresh data
    });
    if (!response.ok) {
      console.error("Availability fetch failed:", response.status);
      return [];
    }
    const data = await response.json();
    console.log("Availability API response:", JSON.stringify(data));
    // API returns { weeklySchedule: [...] }, extract the array
    const availability = data.weeklySchedule || data || [];
    console.log("Parsed availability:", availability.length, "days");
    return availability;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
}

export async function fetchInstructorPackages(
  username: string
): Promise<Package[]> {
  try {
    const response = await fetch(`${API_URL}/public/instructors/${username}/packages`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Error fetching packages:", error);
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
    console.error("Error fetching reviews:", error);
    return { items: [], total: 0 };
  }
}
