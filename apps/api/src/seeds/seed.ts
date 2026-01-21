import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/instructor-saas";

// Schemas (simplified for seeding)
const InstructorSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  businessName: String,
  hourlyRate: Number,
  currency: String,
  // Public profile fields
  username: String,
  bio: String,
  about: String,
  profileImage: String,
  serviceAreas: [String],
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    transmission: String,
    hasLearnerDualControls: Boolean,
  },
  socialLinks: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  isPublicProfileEnabled: Boolean,
  showPricing: Boolean,
  showAvailability: Boolean,
  acceptingNewStudents: Boolean,
}, { timestamps: true });

const LearnerSchema = new mongoose.Schema({
  instructorId: mongoose.Schema.Types.ObjectId,
  email: String,
  firstName: String,
  lastName: String,
  phone: String,
  status: String,
  balance: Number,
  totalLessons: Number,
  completedLessons: Number,
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  instructorId: mongoose.Schema.Types.ObjectId,
  learnerId: mongoose.Schema.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  type: String,
  status: String,
  paymentStatus: String,
  price: Number,
  pickupLocation: String,
  notes: String,
}, { timestamps: true });

const WeeklyAvailabilitySchema = new mongoose.Schema({
  instructorId: mongoose.Schema.Types.ObjectId,
  dayOfWeek: String,
  slots: [{ start: String, end: String }],
  isAvailable: Boolean,
}, { timestamps: true });

async function seed() {
  console.log("🌱 Starting seed...");
  
  await mongoose.connect(MONGODB_URI);
  console.log("📦 Connected to MongoDB");

  const Instructor = mongoose.model("Instructor", InstructorSchema);
  const Learner = mongoose.model("Learner", LearnerSchema);
  const Lesson = mongoose.model("Lesson", LessonSchema);
  const WeeklyAvailability = mongoose.model("WeeklyAvailability", WeeklyAvailabilitySchema);

  // Clear existing data
  await Promise.all([
    Instructor.deleteMany({}),
    Learner.deleteMany({}),
    Lesson.deleteMany({}),
    WeeklyAvailability.deleteMany({}),
  ]);
  console.log("🧹 Cleared existing data");

  // Create instructor
  const hashedPassword = await bcrypt.hash("password123", 12);
  const instructor = await Instructor.create({
    email: "instructor@example.com",
    password: hashedPassword,
    firstName: "John",
    lastName: "Smith",
    phone: "07700 900123",
    businessName: "Smith Driving School",
    hourlyRate: 45,
    currency: "GBP",
    // Public profile fields
    username: "john-smith",
    bio: "Friendly and patient driving instructor with 10+ years of experience helping learners pass their test first time.",
    about: "I've been teaching people to drive since 2014 and have helped over 500 learners pass their driving test. I specialise in nervous drivers and those who have previously failed their test. My teaching style is calm, patient, and tailored to each individual learner's needs.\n\nI offer lessons in both manual and automatic vehicles, and cover all areas of North London including Finchley, Barnet, and Enfield.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    serviceAreas: ["Finchley", "Barnet", "Enfield", "Muswell Hill", "Highgate"],
    vehicleInfo: {
      make: "Ford",
      model: "Fiesta",
      year: 2022,
      transmission: "manual",
      hasLearnerDualControls: true,
    },
    socialLinks: {
      website: "https://smithdrivingschool.co.uk",
      facebook: "https://facebook.com/smithdrivingschool",
      instagram: "https://instagram.com/smithdrivingschool",
    },
    isPublicProfileEnabled: true,
    showPricing: true,
    showAvailability: true,
    acceptingNewStudents: true,
  });
  console.log("👨‍🏫 Created instructor:", instructor.email, "with username:", "john-smith");

  // Create learners
  const learners = await Learner.insertMany([
    {
      instructorId: instructor._id,
      email: "emma.wilson@example.com",
      firstName: "Emma",
      lastName: "Wilson",
      phone: "07700 900001",
      status: "active",
      balance: -90, // Owes £90
      totalLessons: 5,
      completedLessons: 4,
    },
    {
      instructorId: instructor._id,
      email: "james.brown@example.com",
      firstName: "James",
      lastName: "Brown",
      phone: "07700 900002",
      status: "active",
      balance: 0,
      totalLessons: 10,
      completedLessons: 10,
    },
    {
      instructorId: instructor._id,
      email: "sophie.taylor@example.com",
      firstName: "Sophie",
      lastName: "Taylor",
      phone: "07700 900003",
      status: "active",
      balance: -180, // Owes £180
      totalLessons: 8,
      completedLessons: 6,
    },
  ]);
  console.log(`👥 Created ${learners.length} learners`);

  // Create lessons for the next 2 weeks
  const lessons = [];
  const now = new Date();
  const lessonTypes = ["standard", "test-prep", "mock-test", "motorway"];
  
  for (let i = 0; i < 10; i++) {
    const dayOffset = Math.floor(i / 2); // 2 lessons per day
    const isAfternoon = i % 2 === 1;
    
    const startTime = new Date(now);
    startTime.setDate(now.getDate() + dayOffset);
    startTime.setHours(isAfternoon ? 14 : 10, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);
    
    const learner = learners[i % learners.length];
    const isPast = dayOffset < 0 || (dayOffset === 0 && startTime < now);
    
    lessons.push({
      instructorId: instructor._id,
      learnerId: learner._id,
      startTime,
      endTime,
      duration: 120,
      type: lessonTypes[i % lessonTypes.length],
      status: isPast ? "completed" : "scheduled",
      paymentStatus: i < 4 ? "paid" : "pending", // First 4 paid, rest pending
      price: 90,
      pickupLocation: "123 Main Street",
      notes: `Lesson ${i + 1} notes`,
    });
  }

  await Lesson.insertMany(lessons);
  console.log(`📚 Created ${lessons.length} lessons`);

  // Create weekly availability
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const availability = daysOfWeek.map((day) => ({
    instructorId: instructor._id,
    dayOfWeek: day,
    slots: day === "saturday" || day === "sunday"
      ? []
      : [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
    isAvailable: day !== "saturday" && day !== "sunday",
  }));

  await WeeklyAvailability.insertMany(availability);
  console.log("📅 Created weekly availability");

  await mongoose.disconnect();
  console.log("✅ Seed completed!");
  console.log("\n📧 Login credentials:");
  console.log("   Email: instructor@example.com");
  console.log("   Password: password123");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
