import axios from "axios";
import type {
  AuthResponse,
  LoginInput,
  SignupInput,
  SchoolSignupInput,
  Instructor,
  Learner,
  CreateLearner,
  UpdateLearner,
  Lesson,
  CreateLesson,
  UpdateLesson,
  LessonQuery,
  DashboardStats,
  PaginatedResponse,
} from "@acme/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ============================================================================
// Full Dashboard Stats (from /lessons/stats/dashboard)
// ============================================================================

export interface WeeklyTrendItem {
  week: string;
  earnings: number;
  lessons: number;
}

export interface LessonTypeBreakdown {
  type: string;
  label: string;
  count: number;
  revenue: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
}

export interface TodayScheduleItem {
  _id: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: string;
  status: string;
  pickupLocation?: string;
  learner?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface UpcomingTestDate {
  _id: string;
  firstName?: string;
  lastName?: string;
  testDate: string;
}

export interface RecentActivityItem {
  _id: string;
  startTime: string;
  status: string;
  type: string;
  price: number;
  completedAt?: string;
  cancelledAt?: string;
  learner?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface MonthlyHistoryItem {
  month: string;
  earnings: number;
  lessons: number;
}

export interface FullDashboardStats {
  todayLessons: number;
  weekLessons: number;
  activeLearners: number;
  totalLearners: number;
  monthlyEarnings: number;
  earningsChange: number;
  unpaidLessons: number;
  unpaidAmount: number;
  weeklyTrend: WeeklyTrendItem[];
  lessonTypes: LessonTypeBreakdown[];
  completionStats: CompletionStats;
  todaySchedule: TodayScheduleItem[];
  upcomingTestDates: UpcomingTestDate[];
  recentActivity: RecentActivityItem[];
  monthlyHistory: MonthlyHistoryItem[];
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't redirect if already on login page or if it's the login request itself
      const isLoginPage = window.location.pathname === "/login";
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      
      if (!isLoginPage && !isLoginRequest) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Auth
// ============================================================================

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  signup: async (data: SignupInput): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/signup", data);
    return res.data;
  },

  schoolSignup: async (data: SchoolSignupInput): Promise<AuthResponse & { school: any }> => {
    const res = await api.post<AuthResponse & { school: any }>("/auth/school-signup", data);
    return res.data;
  },

  acceptInvitation: async (token: string): Promise<any> => {
    const res = await api.post("/auth/accept-invitation", { token });
    return res.data;
  },

  getMe: async (): Promise<Instructor> => {
    const res = await api.get<Instructor>("/auth/me");
    return res.data;
  },
};

// ============================================================================
// Instructor Profile
// ============================================================================

export interface UpdateInstructorData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessName?: string;
  hourlyRate?: number;
  currency?: string;
  username?: string;
  bio?: string;
  about?: string;
  profileImage?: string;
  coverImage?: string;
  serviceAreas?: Array<{
    name: string;
    postcode?: string;
    coordinates?: number[];
    radiusMiles?: number;
  }>;
  primaryLocation?: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    transmission?: string;
    imageUrl?: string;
  };
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  passRate?: number;
  totalStudentsTaught?: number;
  yearsExperience?: number;
  qualifications?: string[];
  specializations?: string[];
  languages?: string[];
  isPublicProfileEnabled?: boolean;
  showPricing?: boolean;
  showAvailability?: boolean;
  acceptingNewStudents?: boolean;
  lessonTypes?: Array<{
    type: string;
    price: number;
    duration: number;
    description?: string;
  }>;
  cancellationPolicy?: {
    freeCancellationWindowHours?: number;
    lateCancellationWindowHours?: number;
    lateCancellationChargePercent?: number;
    veryLateCancellationChargePercent?: number;
    noShowChargePercent?: number;
    allowLearnerCancellation?: boolean;
    policyText?: string;
  };
}

export const instructorApi = {
  getMe: async (): Promise<Instructor> => {
    const res = await api.get<Instructor>("/instructors/me");
    return res.data;
  },

  update: async (data: UpdateInstructorData): Promise<Instructor> => {
    const res = await api.put<Instructor>("/instructors/me", data);
    return res.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const res = await api.get<{ available: boolean }>(`/instructors/username-check/${username}`);
    return res.data;
  },
};

// ============================================================================
// Learners
// ============================================================================

export const learnersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Learner>> => {
    const res = await api.get<PaginatedResponse<Learner>>("/learners", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Learner> => {
    const res = await api.get<Learner>(`/learners/${id}`);
    return res.data;
  },

  create: async (data: CreateLearner): Promise<Learner> => {
    const res = await api.post<Learner>("/learners", data);
    return res.data;
  },

  update: async (id: string, data: UpdateLearner): Promise<Learner> => {
    const res = await api.put<Learner>(`/learners/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/learners/${id}`);
  },

  getTestReadiness: async (id: string): Promise<{
    testReadiness: string | null;
    testReadinessComment: string | null;
    testReadinessUpdatedAt: string | null;
  }> => {
    const res = await api.get(`/learners/${id}/test-readiness`);
    return res.data;
  },

  updateTestReadiness: async (id: string, data: {
    testReadiness: 'not-ready' | 'nearly-ready' | 'test-ready';
    comment?: string;
  }): Promise<void> => {
    await api.put(`/learners/${id}/test-readiness`, data);
  },
};

// ============================================================================
// Lessons
// ============================================================================

export const lessonsApi = {
  getAll: async (params?: LessonQuery): Promise<PaginatedResponse<Lesson>> => {
    const res = await api.get<PaginatedResponse<Lesson>>("/lessons", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Lesson> => {
    const res = await api.get<Lesson>(`/lessons/${id}`);
    return res.data;
  },

  create: async (data: CreateLesson): Promise<Lesson> => {
    const res = await api.post<Lesson>("/lessons", data);
    return res.data;
  },

  update: async (id: string, data: UpdateLesson): Promise<Lesson> => {
    const res = await api.put<Lesson>(`/lessons/${id}`, data);
    return res.data;
  },

  cancel: async (id: string, reason?: string): Promise<Lesson> => {
    const res = await api.post<Lesson>(`/lessons/${id}/cancel`, { reason });
    return res.data;
  },

  complete: async (id: string, notes?: string): Promise<Lesson> => {
    const res = await api.post<Lesson>(`/lessons/${id}/complete`, { notes });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },

  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>("/lessons/stats");
    return res.data;
  },

  getDashboardStats: async (): Promise<FullDashboardStats> => {
    const res = await api.get<FullDashboardStats>("/lessons/stats/dashboard");
    return res.data;
  },
};

// ============================================================================
// Payments
// ============================================================================

export const paymentsApi = {
  createIntent: async (data: {
    learnerId: string;
    lessonIds?: string[];
    amount: number;
    description?: string;
  }): Promise<{ clientSecret: string; paymentId: string }> => {
    const res = await api.post("/payments/create-intent", data);
    return res.data;
  },

  getByLearner: async (learnerId: string) => {
    const res = await api.get(`/payments/learner/${learnerId}`);
    return res.data;
  },
};

// ============================================================================
// Availability
// ============================================================================

export interface WeeklyAvailability {
  _id: string;
  instructorId: string;
  dayOfWeek: string;
  slots: { start: string; end: string }[];
  isAvailable: boolean;
}

export interface AvailabilityOverride {
  _id: string;
  instructorId: string;
  date: string;
  slots: { start: string; end: string }[];
  isAvailable: boolean;
  reason?: string;
}

export const availabilityApi = {
  getWeekly: async (): Promise<WeeklyAvailability[]> => {
    const res = await api.get<WeeklyAvailability[]>("/availability");
    return res.data;
  },

  updateWeekly: async (data: Array<{
    dayOfWeek: string;
    slots: { start: string; end: string }[];
    isAvailable: boolean;
  }>): Promise<WeeklyAvailability[]> => {
    const res = await api.put<WeeklyAvailability[]>("/availability", data);
    return res.data;
  },

  getOverrides: async (params?: { from?: string; to?: string }): Promise<AvailabilityOverride[]> => {
    const res = await api.get<AvailabilityOverride[]>("/availability/overrides", { params });
    return res.data;
  },

  createOverride: async (data: {
    date: string;
    slots?: { start: string; end: string }[];
    isAvailable: boolean;
    reason?: string;
  }): Promise<AvailabilityOverride> => {
    const res = await api.post<AvailabilityOverride>("/availability/overrides", data);
    return res.data;
  },

  deleteOverride: async (date: string): Promise<void> => {
    await api.delete(`/availability/overrides/${date}`);
  },
};

// ============================================================================
// Packages
// ============================================================================

export interface Package {
  _id: string;
  instructorId: string;
  name: string;
  description?: string;
  lessonCount: number;
  price: number;
  discountPercent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const packagesApi = {
  getAll: async (): Promise<Package[]> => {
    const res = await api.get<Package[]>("/packages");
    return res.data;
  },

  getActive: async (): Promise<Package[]> => {
    const res = await api.get<Package[]>("/packages/active");
    return res.data;
  },

  getById: async (id: string): Promise<Package> => {
    const res = await api.get<Package>(`/packages/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    lessonCount: number;
    price: number;
    discountPercent?: number;
    isActive?: boolean;
  }): Promise<Package> => {
    const res = await api.post<Package>("/packages", data);
    return res.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    description?: string;
    lessonCount: number;
    price: number;
    discountPercent?: number;
    isActive?: boolean;
  }>): Promise<Package> => {
    const res = await api.put<Package>(`/packages/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },
};

// ============================================================================
// Notifications
// ============================================================================

export interface AppNotification {
  _id: string;
  instructorId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  lessonId?: string;
  learnerId?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  getAll: async (opts?: { unreadOnly?: boolean; limit?: number }): Promise<AppNotification[]> => {
    const params = new URLSearchParams();
    if (opts?.unreadOnly) params.set("unreadOnly", "true");
    if (opts?.limit) params.set("limit", opts.limit.toString());
    const res = await api.get<AppNotification[]>(`/notifications?${params.toString()}`);
    return res.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const res = await api.get<{ count: number }>("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const res = await api.patch<AppNotification>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const res = await api.patch<{ updated: number }>("/notifications/read-all");
    return res.data;
  },
};

// ============================================================================
// Syllabus
// ============================================================================

export interface SyllabusTopic {
  order: number;
  title: string;
  description?: string;
  category: string;
  keySkills: string[];
}

export interface SyllabusData {
  _id: string;
  instructorId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  topics: SyllabusTopic[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicProgressEntry {
  topicOrder: number;
  status: "not-started" | "in-progress" | "completed";
  currentScore: number;
  attempts: number;
  history: Array<{
    lessonId?: string;
    date: string;
    score: number;
    notes?: string;
  }>;
  completedAt?: string;
}

export interface LearnerProgressData {
  _id: string;
  learnerId: string;
  instructorId: string;
  syllabusId: string;
  topicProgress: TopicProgressEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LearnerProgressWithSyllabus {
  progress: LearnerProgressData;
  syllabus: SyllabusData;
}

export const syllabusApi = {
  getAll: async (): Promise<SyllabusData[]> => {
    const res = await api.get<SyllabusData[]>("/syllabus");
    return res.data;
  },

  getDefault: async (): Promise<SyllabusData> => {
    const res = await api.get<SyllabusData>("/syllabus/default");
    return res.data;
  },

  getById: async (id: string): Promise<SyllabusData> => {
    const res = await api.get<SyllabusData>(`/syllabus/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    isDefault?: boolean;
    topics: SyllabusTopic[];
  }): Promise<SyllabusData> => {
    const res = await api.post<SyllabusData>("/syllabus", data);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      isDefault?: boolean;
      topics: SyllabusTopic[];
    }>,
  ): Promise<SyllabusData> => {
    const res = await api.put<SyllabusData>(`/syllabus/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/syllabus/${id}`);
  },

  // Progress
  initProgress: async (data: {
    learnerId: string;
    syllabusId?: string;
  }): Promise<LearnerProgressData> => {
    const res = await api.post<LearnerProgressData>("/syllabus/progress/init", data);
    return res.data;
  },

  getProgress: async (learnerId: string): Promise<LearnerProgressWithSyllabus | null> => {
    const res = await api.get<LearnerProgressWithSyllabus | null>(
      `/syllabus/progress/learner/${learnerId}`,
    );
    return res.data;
  },

  scoreTopic: async (data: {
    lessonId: string;
    learnerId: string;
    topicOrder: number;
    score: number;
    notes?: string;
  }): Promise<LearnerProgressData> => {
    const res = await api.post<LearnerProgressData>("/syllabus/progress/score", data);
    return res.data;
  },

  completeTopic: async (data: {
    learnerId: string;
    topicOrder: number;
  }): Promise<LearnerProgressData> => {
    const res = await api.post<LearnerProgressData>("/syllabus/progress/complete", data);
    return res.data;
  },

  reopenTopic: async (data: {
    learnerId: string;
    topicOrder: number;
  }): Promise<LearnerProgressData> => {
    const res = await api.post<LearnerProgressData>("/syllabus/progress/reopen", data);
    return res.data;
  },
};

// ============================================================================
// Schools
// ============================================================================

export interface SchoolData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
  };
  logo?: string;
  businessRegistrationNumber?: string;
  ownerId: string;
  settings?: {
    defaultHourlyRate?: number;
    defaultCurrency?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolInstructor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  profileImage?: string;
}

export interface SchoolInvitationData {
  _id: string;
  schoolId: string;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolDashboardData {
  instructorCount: number;
  instructors: SchoolInstructor[];
  totalLessons: number;
  completedLessons: number;
  totalRevenue: number;
  activeLearnerCount: number;
}

export const schoolsApi = {
  create: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: { line1?: string; line2?: string; city?: string; postcode?: string };
    logo?: string;
    businessRegistrationNumber?: string;
  }): Promise<SchoolData> => {
    const res = await api.post<SchoolData>("/schools", data);
    return res.data;
  },

  getMine: async (): Promise<SchoolData | null> => {
    const res = await api.get<SchoolData | null>("/schools/mine");
    return res.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    email: string;
    phone?: string;
    address?: { line1?: string; line2?: string; city?: string; postcode?: string };
    logo?: string;
    businessRegistrationNumber?: string;
  }>): Promise<SchoolData> => {
    const res = await api.put<SchoolData>(`/schools/${id}`, data);
    return res.data;
  },

  inviteInstructor: async (schoolId: string, data: {
    email: string;
    role?: 'admin' | 'instructor';
  }): Promise<SchoolInvitationData> => {
    const res = await api.post<SchoolInvitationData>(`/schools/${schoolId}/invitations`, data);
    return res.data;
  },

  listInvitations: async (schoolId: string): Promise<SchoolInvitationData[]> => {
    const res = await api.get<SchoolInvitationData[]>(`/schools/${schoolId}/invitations`);
    return res.data;
  },

  cancelInvitation: async (schoolId: string, invitationId: string): Promise<void> => {
    await api.delete(`/schools/${schoolId}/invitations/${invitationId}`);
  },

  listInstructors: async (schoolId: string): Promise<SchoolInstructor[]> => {
    const res = await api.get<SchoolInstructor[]>(`/schools/${schoolId}/instructors`);
    return res.data;
  },

  updateInstructorRole: async (schoolId: string, instructorId: string, role: string): Promise<void> => {
    await api.put(`/schools/${schoolId}/instructors/${instructorId}/role`, { role });
  },

  removeInstructor: async (schoolId: string, instructorId: string): Promise<void> => {
    await api.delete(`/schools/${schoolId}/instructors/${instructorId}`);
  },

  getInstructorDetail: async (schoolId: string, instructorId: string): Promise<any> => {
    const res = await api.get<any>(`/schools/${schoolId}/instructors/${instructorId}/detail`);
    return res.data;
  },

  getInstructorLearners: async (schoolId: string, instructorId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/schools/${schoolId}/instructors/${instructorId}/learners`);
    return res.data;
  },

  getInstructorLearnerDetail: async (schoolId: string, instructorId: string, learnerId: string): Promise<any> => {
    const res = await api.get<any>(`/schools/${schoolId}/instructors/${instructorId}/learners/${learnerId}`);
    return res.data;
  },

  getDashboard: async (schoolId: string): Promise<SchoolDashboardData> => {
    const res = await api.get<SchoolDashboardData>(`/schools/${schoolId}/dashboard`);
    return res.data;
  },

  // School-level packages
  listPackages: async (schoolId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/schools/${schoolId}/packages`);
    return res.data;
  },
  createPackage: async (schoolId: string, data: any): Promise<any> => {
    const res = await api.post<any>(`/schools/${schoolId}/packages`, data);
    return res.data;
  },
  updatePackage: async (schoolId: string, packageId: string, data: any): Promise<any> => {
    const res = await api.put<any>(`/schools/${schoolId}/packages/${packageId}`, data);
    return res.data;
  },
  deletePackage: async (schoolId: string, packageId: string): Promise<void> => {
    await api.delete(`/schools/${schoolId}/packages/${packageId}`);
  },

  // School-level syllabus
  listSyllabus: async (schoolId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/schools/${schoolId}/syllabus`);
    return res.data;
  },
  createSyllabus: async (schoolId: string, data: any): Promise<any> => {
    const res = await api.post<any>(`/schools/${schoolId}/syllabus`, data);
    return res.data;
  },
  updateSyllabus: async (schoolId: string, syllabusId: string, data: any): Promise<any> => {
    const res = await api.put<any>(`/schools/${schoolId}/syllabus/${syllabusId}`, data);
    return res.data;
  },
  deleteSyllabus: async (schoolId: string, syllabusId: string): Promise<void> => {
    await api.delete(`/schools/${schoolId}/syllabus/${syllabusId}`);
  },

  // School policies
  getPolicies: async (schoolId: string): Promise<any> => {
    const res = await api.get<any>(`/schools/${schoolId}/policies`);
    return res.data;
  },
  updatePolicies: async (schoolId: string, data: any): Promise<any> => {
    const res = await api.put<any>(`/schools/${schoolId}/policies`, data);
    return res.data;
  },
};

// ============================================================================
// Vehicles
// ============================================================================

export interface VehicleData {
  _id: string;
  schoolId: string;
  make: string;
  model: string;
  year?: number;
  registration: string;
  transmission: string;
  color?: string;
  imageUrl?: string;
  hasLearnerDualControls: boolean;
  status: string;
  insuranceExpiry?: string;
  motExpiry?: string;
  notes?: string;
  assignments?: Array<{
    _id: string;
    instructorId: { _id: string; firstName: string; lastName: string; email: string };
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAssignmentData {
  _id: string;
  vehicleId: { _id: string; make: string; model: string; registration: string; transmission: string; status: string };
  instructorId: { _id: string; firstName: string; lastName: string; email: string };
  isPrimary: boolean;
  createdAt: string;
}

export const vehiclesApi = {
  create: async (data: {
    make: string;
    model: string;
    year?: number;
    registration: string;
    transmission?: string;
    color?: string;
    imageUrl?: string;
    hasLearnerDualControls?: boolean;
    insuranceExpiry?: string;
    motExpiry?: string;
    notes?: string;
  }): Promise<VehicleData> => {
    const res = await api.post<VehicleData>("/vehicles", data);
    return res.data;
  },

  getAll: async (): Promise<VehicleData[]> => {
    const res = await api.get<VehicleData[]>("/vehicles");
    return res.data;
  },

  getById: async (id: string): Promise<VehicleData> => {
    const res = await api.get<VehicleData>(`/vehicles/${id}`);
    return res.data;
  },

  getMine: async (): Promise<VehicleData[]> => {
    const res = await api.get<VehicleData[]>("/vehicles/mine");
    return res.data;
  },

  update: async (id: string, data: Partial<{
    make: string;
    model: string;
    year?: number;
    registration: string;
    transmission?: string;
    color?: string;
    imageUrl?: string;
    hasLearnerDualControls?: boolean;
    status?: string;
    insuranceExpiry?: string;
    motExpiry?: string;
    notes?: string;
  }>): Promise<VehicleData> => {
    const res = await api.put<VehicleData>(`/vehicles/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  assign: async (vehicleId: string, data: { instructorId: string; isPrimary?: boolean }) => {
    const res = await api.post(`/vehicles/${vehicleId}/assign`, data);
    return res.data;
  },

  unassign: async (vehicleId: string, instructorId: string): Promise<void> => {
    await api.delete(`/vehicles/${vehicleId}/assign/${instructorId}`);
  },

  listAssignments: async (): Promise<VehicleAssignmentData[]> => {
    const res = await api.get<VehicleAssignmentData[]>("/vehicles/assignments");
    return res.data;
  },
};

export default api;
