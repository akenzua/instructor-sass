import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instructor-saas';

// Schemas (simplified for seeding)
const InstructorSchema = new mongoose.Schema(
  {
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
    primaryLocation: String,
    // GeoJSON location for geospatial queries
    geoLocation: {
      type: { type: String, default: 'Point' },
      coordinates: [Number], // [longitude, latitude]
    },
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
    lessonTypes: [
      {
        type: { type: String },
        price: Number,
        duration: Number,
        description: String,
      },
    ],
    isPublicProfileEnabled: Boolean,
    showPricing: Boolean,
    showAvailability: Boolean,
    acceptingNewStudents: Boolean,
    // School / multi-instructor fields
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    role: { type: String, enum: ['owner', 'admin', 'instructor'], default: null },
    isTeaching: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add 2dsphere index for geospatial queries
InstructorSchema.index({ geoLocation: '2dsphere' });

const LearnerSchema = new mongoose.Schema(
  {
    instructorId: mongoose.Schema.Types.ObjectId,
    email: String,
    firstName: String,
    lastName: String,
    phone: String,
    status: String,
    balance: Number,
    totalLessons: Number,
    completedLessons: Number,
  },
  { timestamps: true }
);

const LessonSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const WeeklyAvailabilitySchema = new mongoose.Schema(
  {
    instructorId: mongoose.Schema.Types.ObjectId,
    dayOfWeek: String,
    slots: [{ start: String, end: String }],
    isAvailable: Boolean,
  },
  { timestamps: true }
);

const PackageSchema = new mongoose.Schema(
  {
    instructorId: mongoose.Schema.Types.ObjectId,
    schoolId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    lessonCount: Number,
    price: Number,
    discountPercent: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const SchoolSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    logo: String,
    businessRegistrationNumber: String,
    ownerId: mongoose.Schema.Types.ObjectId,
    settings: {
      defaultHourlyRate: Number,
      defaultCurrency: String,
    },
    lessonTypes: [
      {
        type: { type: String },
        price: Number,
        duration: Number,
        description: String,
      },
    ],
    cancellationPolicy: {
      hoursBeforeLesson: Number,
      refundPercentage: Number,
      description: String,
    },
    status: String,
  },
  { timestamps: true }
);

const VehicleSchema = new mongoose.Schema(
  {
    schoolId: mongoose.Schema.Types.ObjectId,
    make: String,
    model: String,
    year: Number,
    registration: String,
    transmission: String,
    color: String,
    hasLearnerDualControls: Boolean,
    status: String,
    insuranceExpiry: Date,
    motExpiry: Date,
    notes: String,
  },
  { timestamps: true }
);

const VehicleAssignmentSchema = new mongoose.Schema(
  {
    vehicleId: mongoose.Schema.Types.ObjectId,
    instructorId: mongoose.Schema.Types.ObjectId,
    schoolId: mongoose.Schema.Types.ObjectId,
    isPrimary: Boolean,
    status: String,
  },
  { timestamps: true }
);

async function seed() {
  console.log('🌱 Starting seed...');

  await mongoose.connect(MONGODB_URI);
  console.log('📦 Connected to MongoDB');

  const Instructor = mongoose.model('Instructor', InstructorSchema);
  const Learner = mongoose.model('Learner', LearnerSchema);
  const Lesson = mongoose.model('Lesson', LessonSchema);
  const WeeklyAvailability = mongoose.model('WeeklyAvailability', WeeklyAvailabilitySchema);
  const Package = mongoose.model('Package', PackageSchema);
  const SchoolModel = mongoose.model('School', SchoolSchema);
  const VehicleModel = mongoose.model('Vehicle', VehicleSchema);
  const VehicleAssignmentModel = mongoose.model('VehicleAssignment', VehicleAssignmentSchema);

  // Payment schema for cleanup (no Mongoose model needed, use raw collection)
  const PaymentSchema = new mongoose.Schema({}, { strict: false });
  const Payment = mongoose.model('Payment', PaymentSchema);
  const MagicLinkToken = mongoose.model('MagicLinkToken', new mongoose.Schema({}, { strict: false }));

  // Clear existing data (including payments and magic link tokens)
  await Promise.all([
    Instructor.deleteMany({}),
    Learner.deleteMany({}),
    Lesson.deleteMany({}),
    WeeklyAvailability.deleteMany({}),
    Package.deleteMany({}),
    Payment.deleteMany({}),
    MagicLinkToken.deleteMany({}),
    SchoolModel.deleteMany({}),
    VehicleModel.deleteMany({}),
    VehicleAssignmentModel.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data (including payments, schools, vehicles)');

  // Create instructor
  const hashedPassword = await bcrypt.hash('password123', 12);
  const instructor = await Instructor.create({
    email: 'instructor@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Smith',
    phone: '07700 900123',
    businessName: 'Smith Driving School',
    hourlyRate: 45,
    currency: 'GBP',
    // Public profile fields
    username: 'john-smith',
    bio: 'Friendly and patient driving instructor with 10+ years of experience helping learners pass their test first time.',
    about:
      "I've been teaching people to drive since 2014 and have helped over 500 learners pass their driving test. I specialise in nervous drivers and those who have previously failed their test. My teaching style is calm, patient, and tailored to each individual learner's needs.\n\nI offer lessons in both manual and automatic vehicles, and cover all areas of North London including Finchley, Barnet, and Enfield.",
    profileImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    serviceAreas: ['Finchley', 'Barnet', 'Enfield', 'Muswell Hill', 'Highgate'],
    primaryLocation: 'Finchley, North London',
    // Finchley coordinates: 51.5993, -0.1869
    geoLocation: {
      type: 'Point',
      coordinates: [-0.1869, 51.5993],
    },
    vehicleInfo: {
      make: 'Ford',
      model: 'Fiesta',
      year: 2022,
      transmission: 'manual',
      hasLearnerDualControls: true,
    },
    socialLinks: {
      website: 'https://smithdrivingschool.co.uk',
      facebook: 'https://facebook.com/smithdrivingschool',
      instagram: 'https://instagram.com/smithdrivingschool',
    },
    lessonTypes: [
      { type: 'standard', price: 45, duration: 60, description: 'Standard 1-hour driving lesson' },
      {
        type: 'test-prep',
        price: 50,
        duration: 60,
        description: 'Focused test preparation lesson',
      },
      {
        type: 'mock-test',
        price: 60,
        duration: 90,
        description: 'Full mock driving test experience',
      },
      { type: 'motorway', price: 55, duration: 90, description: 'Motorway driving lesson' },
      {
        type: 'refresher',
        price: 45,
        duration: 60,
        description: 'Refresher lesson for returning drivers',
      },
    ],
    isPublicProfileEnabled: true,
    showPricing: true,
    showAvailability: true,
    acceptingNewStudents: true,
    passRate: 92,
    yearsExperience: 10,
    totalStudentsTaught: 500,
    qualifications: ['ADI Badge', 'Fleet Trainer'],
    specializations: ['Nervous drivers', 'Test preparation'],
    languages: ['English'],
  });
  console.log('👨‍🏫 Created instructor:', instructor.email, 'with username:', 'john-smith');

  // Create additional instructors for marketplace
  const additionalInstructors = [
    {
      email: 'sarah.johnson@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '07700 900200',
      businessName: "Sarah's Driving Academy",
      hourlyRate: 42,
      currency: 'GBP',
      username: 'sarah-johnson',
      bio: 'Patient and encouraging instructor specializing in nervous learners. High first-time pass rate!',
      about:
        'With 8 years of experience, I understand that learning to drive can be nerve-wracking. My calm approach helps even the most anxious learners gain confidence behind the wheel.',
      profileImage:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Camden', 'Islington', 'Kings Cross', 'Holloway'],
      primaryLocation: 'Camden, North London',
      // Camden coordinates: 51.5390, -0.1426
      geoLocation: {
        type: 'Point',
        coordinates: [-0.1426, 51.5390],
      },
      vehicleInfo: { make: 'Toyota', model: 'Yaris', year: 2023, transmission: 'automatic' },
      lessonTypes: [],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 88,
      yearsExperience: 8,
      totalStudentsTaught: 320,
      qualifications: ['ADI Badge'],
      specializations: ['Nervous drivers', 'Automatic only'],
      languages: ['English', 'Spanish'],
    },
    {
      email: 'michael.chen@example.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '07700 900201',
      businessName: 'Chen Driving School',
      hourlyRate: 48,
      currency: 'GBP',
      username: 'michael-chen',
      bio: 'Expert instructor with a focus on defensive driving techniques. Learn to drive safely and confidently.',
      about:
        'I bring 15 years of professional driving experience to my teaching. My lessons emphasize safety, awareness, and building lifelong driving habits.',
      profileImage:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Westminster', 'Kensington', 'Chelsea', 'Mayfair'],
      primaryLocation: 'Westminster, Central London',
      // Westminster coordinates: 51.4975, -0.1357
      geoLocation: {
        type: 'Point',
        coordinates: [-0.1357, 51.4975],
      },
      vehicleInfo: { make: 'BMW', model: '1 Series', year: 2023, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 48, duration: 60, description: 'Premium driving lesson' },
        { type: 'motorway', price: 65, duration: 90, description: 'Motorway confidence' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 95,
      yearsExperience: 15,
      totalStudentsTaught: 750,
      qualifications: ['ADI Badge', 'Advanced Driving Certificate', 'Fleet Trainer'],
      specializations: ['Motorway lessons', 'Defensive driving'],
      languages: ['English', 'Mandarin'],
    },
    {
      email: 'priya.patel@example.com',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '07700 900202',
      businessName: 'Priya Driving Tuition',
      hourlyRate: 40,
      currency: 'GBP',
      username: 'priya-patel',
      bio: 'Affordable, friendly lessons in East London. Female instructor available for those who prefer.',
      about:
        'I offer flexible scheduling and competitive rates. As a female instructor, I provide a comfortable learning environment for all students.',
      profileImage:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Stratford', 'Hackney', 'Bow', 'Mile End', 'Bethnal Green'],
      primaryLocation: 'Stratford, East London',
      // Stratford coordinates: 51.5423, -0.0026
      geoLocation: {
        type: 'Point',
        coordinates: [-0.0026, 51.5423],
      },
      vehicleInfo: { make: 'Vauxhall', model: 'Corsa', year: 2022, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 40, duration: 60, description: 'Standard lesson' },
        { type: 'test-prep', price: 45, duration: 60, description: 'Test preparation' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 85,
      yearsExperience: 6,
      totalStudentsTaught: 200,
      qualifications: ['ADI Badge'],
      specializations: ['Nervous drivers', 'Female learners'],
      languages: ['English', 'Hindi', 'Gujarati'],
    },
    {
      email: 'david.wilson@example.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Wilson',
      phone: '07700 900203',
      businessName: 'Wilson Pass Plus',
      hourlyRate: 50,
      currency: 'GBP',
      username: 'david-wilson',
      bio: 'Intensive course specialist. Pass your test in 1-2 weeks with our crash course programs.',
      about:
        'I specialize in intensive driving courses for those who need to pass quickly. Flexible scheduling with block booking discounts available.',
      profileImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Croydon', 'Bromley', 'Lewisham', 'Greenwich'],
      primaryLocation: 'Croydon, South London',
      // Croydon coordinates: 51.3762, -0.0982
      geoLocation: {
        type: 'Point',
        coordinates: [-0.0982, 51.3762],
      },
      vehicleInfo: { make: 'Volkswagen', model: 'Golf', year: 2023, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 50, duration: 60, description: 'Standard lesson' },
        { type: 'intensive', price: 300, duration: 360, description: 'Full day intensive' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 90,
      yearsExperience: 12,
      totalStudentsTaught: 600,
      qualifications: ['ADI Badge', 'Pass Plus Registered'],
      specializations: ['Intensive courses', 'Fast-track learning'],
      languages: ['English'],
    },
    {
      email: 'emma.thompson@example.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Thompson',
      phone: '07700 900204',
      businessName: 'Emma T Driving',
      hourlyRate: 44,
      currency: 'GBP',
      username: 'emma-thompson',
      bio: 'Calm and patient instructor. Specializing in refresher lessons for returning drivers.',
      about:
        "Whether you haven't driven in years or need to build confidence after an accident, I can help you get back on the road safely.",
      profileImage:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Richmond', 'Twickenham', 'Kingston', 'Wimbledon'],
      primaryLocation: 'Richmond, South West London',
      // Richmond coordinates: 51.4613, -0.3037
      geoLocation: {
        type: 'Point',
        coordinates: [-0.3037, 51.4613],
      },
      vehicleInfo: { make: 'Nissan', model: 'Micra', year: 2022, transmission: 'automatic' },
      lessonTypes: [
        { type: 'standard', price: 44, duration: 60, description: 'Standard lesson' },
        { type: 'refresher', price: 44, duration: 60, description: 'Refresher course' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 87,
      yearsExperience: 9,
      totalStudentsTaught: 380,
      qualifications: ['ADI Badge'],
      specializations: ['Refresher courses', 'Nervous drivers'],
      languages: ['English', 'French'],
    },
    {
      email: 'james.olu@example.com',
      password: hashedPassword,
      firstName: 'James',
      lastName: 'Olu',
      phone: '07700 900205',
      businessName: 'JO Driving Academy',
      hourlyRate: 38,
      currency: 'GBP',
      username: 'james-olu',
      bio: 'Affordable lessons in South London. Weekend and evening availability.',
      about:
        "I understand budgets are tight. That's why I offer competitive rates without compromising on quality instruction.",
      profileImage:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Brixton', 'Peckham', 'Camberwell', 'Dulwich'],
      primaryLocation: 'Brixton, South London',
      // Brixton coordinates: 51.4613, -0.1156
      geoLocation: {
        type: 'Point',
        coordinates: [-0.1156, 51.4613],
      },
      vehicleInfo: { make: 'Kia', model: 'Picanto', year: 2021, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 38, duration: 60, description: 'Standard lesson' },
        { type: 'block-10', price: 350, duration: 600, description: '10 lesson block' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 82,
      yearsExperience: 5,
      totalStudentsTaught: 150,
      qualifications: ['ADI Badge'],
      specializations: ['Budget-friendly', 'Evening lessons'],
      languages: ['English', 'Yoruba'],
    },
    {
      email: 'lisa.brown@example.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Brown',
      phone: '07700 900206',
      businessName: "Brown's Driving School",
      hourlyRate: 46,
      currency: 'GBP',
      username: 'lisa-brown',
      bio: 'Family-run driving school with over 20 years of combined experience. Quality teaching guaranteed.',
      about:
        'Our family has been teaching driving for two decades. We pride ourselves on personalized instruction and high pass rates.',
      profileImage:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Ealing', 'Acton', 'Chiswick', 'Hammersmith'],
      primaryLocation: 'Ealing, West London',
      // Ealing coordinates: 51.5130, -0.3089
      geoLocation: {
        type: 'Point',
        coordinates: [-0.3089, 51.5130],
      },
      vehicleInfo: { make: 'Ford', model: 'Focus', year: 2023, transmission: 'both' },
      lessonTypes: [
        { type: 'standard', price: 46, duration: 60, description: 'Standard lesson' },
        { type: 'test-prep', price: 52, duration: 60, description: 'Test day preparation' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 91,
      yearsExperience: 11,
      totalStudentsTaught: 520,
      qualifications: ['ADI Badge', 'ORDIT Registered'],
      specializations: ['Test preparation', 'Manual only'],
      languages: ['English'],
    },
    {
      email: 'ahmed.hassan@example.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      phone: '07700 900207',
      businessName: 'Hassan Driving Tuition',
      hourlyRate: 43,
      currency: 'GBP',
      username: 'ahmed-hassan',
      bio: 'Multilingual instructor covering North West London. Patient approach for all skill levels.',
      about:
        'I speak English, Arabic, and Urdu fluently. My diverse background helps me connect with learners from all communities.',
      profileImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Wembley', 'Harrow', 'Stanmore', 'Edgware'],
      primaryLocation: 'Wembley, North West London',
      // Wembley coordinates: 51.5560, -0.2795
      geoLocation: {
        type: 'Point',
        coordinates: [-0.2795, 51.5560],
      },
      vehicleInfo: { make: 'Hyundai', model: 'i20', year: 2022, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 43, duration: 60, description: 'Standard lesson' },
        { type: 'extended', price: 80, duration: 120, description: '2-hour session' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 86,
      yearsExperience: 7,
      totalStudentsTaught: 280,
      qualifications: ['ADI Badge'],
      specializations: ['Multilingual', 'Patient teaching'],
      languages: ['English', 'Arabic', 'Urdu'],
    },
    {
      email: 'claire.murphy@example.com',
      password: hashedPassword,
      firstName: 'Claire',
      lastName: 'Murphy',
      phone: '07700 900208',
      businessName: 'Murphy Motoring',
      hourlyRate: 47,
      currency: 'GBP',
      username: 'claire-murphy',
      bio: 'Experienced instructor with a modern teaching approach. Using latest techniques and technology.',
      about:
        'I incorporate dash cams and video review into my lessons so students can see their progress. Modern methods for modern learners.',
      profileImage:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Wandsworth', 'Putney', 'Fulham', 'Battersea'],
      primaryLocation: 'Wandsworth, South West London',
      // Wandsworth coordinates: 51.4571, -0.1918
      geoLocation: {
        type: 'Point',
        coordinates: [-0.1918, 51.4571],
      },
      vehicleInfo: { make: 'Mini', model: 'Cooper', year: 2023, transmission: 'automatic' },
      lessonTypes: [
        { type: 'standard', price: 47, duration: 60, description: 'Standard lesson' },
        { type: 'mock-test', price: 60, duration: 90, description: 'Mock driving test' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: false,
      passRate: 93,
      yearsExperience: 10,
      totalStudentsTaught: 450,
      qualifications: ['ADI Badge', 'Diamond Advanced'],
      specializations: ['Video review', 'Mock tests'],
      languages: ['English'],
    },
    {
      email: 'tom.clarke@example.com',
      password: hashedPassword,
      firstName: 'Tom',
      lastName: 'Clarke',
      phone: '07700 900209',
      businessName: "Clarke's Driving Lessons",
      hourlyRate: 41,
      currency: 'GBP',
      username: 'tom-clarke',
      bio: 'Friendly local instructor covering Tottenham and surrounding areas. Great value lessons.',
      about:
        "I've lived and worked in North London my whole life. I know every road, every test route, and every tricky junction.",
      profileImage:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Tottenham', 'Wood Green', 'Edmonton', 'Palmers Green'],
      primaryLocation: 'Tottenham, North London',
      // Tottenham coordinates: 51.5882, -0.0720
      geoLocation: {
        type: 'Point',
        coordinates: [-0.0720, 51.5882],
      },
      vehicleInfo: { make: 'Peugeot', model: '208', year: 2022, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 41, duration: 60, description: 'Standard lesson' },
        { type: 'test-prep', price: 46, duration: 60, description: 'Test preparation' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 84,
      yearsExperience: 6,
      totalStudentsTaught: 220,
      qualifications: ['ADI Badge'],
      specializations: ['Local expert', 'Test routes'],
      languages: ['English'],
    },
    {
      email: 'nina.kovacs@example.com',
      password: hashedPassword,
      firstName: 'Nina',
      lastName: 'Kovacs',
      phone: '07700 900210',
      businessName: 'Nina K Driving',
      hourlyRate: 45,
      currency: 'GBP',
      username: 'nina-kovacs',
      bio: 'Automatic specialist with a brand new electric vehicle. Eco-friendly driving lessons.',
      about:
        'Learn to drive in a fully electric car! Experience the future of driving while getting your license. Smooth, quiet, and environmentally friendly.',
      profileImage:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Hampstead', 'Golders Green', 'Hendon', 'Mill Hill'],
      primaryLocation: 'Hampstead, North London',
      // Hampstead coordinates: 51.5562, -0.1780
      geoLocation: {
        type: 'Point',
        coordinates: [-0.1780, 51.5562],
      },
      vehicleInfo: { make: 'Tesla', model: 'Model 3', year: 2024, transmission: 'automatic' },
      lessonTypes: [
        { type: 'standard', price: 45, duration: 60, description: 'Electric car lesson' },
        { type: 'eco-driving', price: 50, duration: 60, description: 'Eco-driving techniques' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 89,
      yearsExperience: 8,
      totalStudentsTaught: 340,
      qualifications: ['ADI Badge', 'EV Specialist'],
      specializations: ['Electric vehicles', 'Automatic only'],
      languages: ['English', 'Hungarian', 'German'],
    },
    {
      email: 'robert.kelly@example.com',
      password: hashedPassword,
      firstName: 'Robert',
      lastName: 'Kelly',
      phone: '07700 900211',
      businessName: 'Kelly Driving Academy',
      hourlyRate: 52,
      currency: 'GBP',
      username: 'robert-kelly',
      bio: 'Premium driving instruction with a focus on excellence. Advanced training available.',
      about:
        'For those who want more than just a license. I teach advanced driving skills, hazard perception, and create truly confident drivers.',
      profileImage:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['City of London', 'Canary Wharf', 'Docklands', 'Tower Hamlets'],
      primaryLocation: 'City of London',
      // City of London coordinates: 51.5155, -0.0922
      geoLocation: {
        type: 'Point',
        coordinates: [-0.0922, 51.5155],
      },
      vehicleInfo: { make: 'Mercedes', model: 'A-Class', year: 2024, transmission: 'both' },
      lessonTypes: [
        { type: 'standard', price: 52, duration: 60, description: 'Premium lesson' },
        { type: 'advanced', price: 70, duration: 90, description: 'Advanced driving' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 96,
      yearsExperience: 18,
      totalStudentsTaught: 900,
      qualifications: ['ADI Badge', 'Diamond Advanced', 'RoSPA Gold'],
      specializations: ['Advanced driving', 'Premium service'],
      languages: ['English'],
    },
    {
      email: 'fatima.ali@example.com',
      password: hashedPassword,
      firstName: 'Fatima',
      lastName: 'Ali',
      phone: '07700 900212',
      businessName: "Fatima's Driving School",
      hourlyRate: 39,
      currency: 'GBP',
      username: 'fatima-ali',
      bio: 'Female instructor offering comfortable, supportive lessons. Flexible hours including weekends.',
      about:
        'I create a welcoming environment for all learners, especially those who feel more comfortable with a female instructor.',
      profileImage:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
      serviceAreas: ['Ilford', 'Redbridge', 'Barking', 'Dagenham'],
      primaryLocation: 'Ilford, East London',
      // Ilford coordinates: 51.5590, 0.0741
      geoLocation: {
        type: 'Point',
        coordinates: [0.0741, 51.5590],
      },
      vehicleInfo: { make: 'Suzuki', model: 'Swift', year: 2022, transmission: 'manual' },
      lessonTypes: [
        { type: 'standard', price: 39, duration: 60, description: 'Standard lesson' },
        { type: 'weekend', price: 42, duration: 60, description: 'Weekend lesson' },
      ],
      isPublicProfileEnabled: true,
      showPricing: true,
      showAvailability: true,
      acceptingNewStudents: true,
      passRate: 83,
      yearsExperience: 4,
      totalStudentsTaught: 120,
      qualifications: ['ADI Badge'],
      specializations: ['Female learners', 'Weekend availability'],
      languages: ['English', 'Urdu', 'Punjabi'],
    },
  ];

  const createdInstructors = await Instructor.insertMany(additionalInstructors);
  console.log(`👨‍🏫 Created ${createdInstructors.length + 1} instructors total`);

  // Create a demo school
  const school = await SchoolModel.create({
    name: 'Smith Driving School',
    email: 'info@smithdrivingschool.co.uk',
    phone: '020 7946 0958',
    businessRegistrationNumber: 'DSA-12345',
    ownerId: instructor._id,
    settings: { defaultHourlyRate: 45, defaultCurrency: 'GBP' },
    lessonTypes: [
      { type: 'standard', price: 45, duration: 60, description: 'Standard driving lesson' },
      { type: 'test-prep', price: 50, duration: 60, description: 'Test preparation lesson' },
      { type: 'intensive', price: 170, duration: 240, description: '4-hour intensive session' },
      { type: 'motorway', price: 55, duration: 90, description: 'Motorway driving lesson' },
    ],
    cancellationPolicy: {
      hoursBeforeLesson: 24,
      refundPercentage: 100,
      description: 'Free cancellation up to 24 hours before the lesson',
    },
    status: 'active',
  });

  // Link the main instructor as school owner (admin-only by default, not teaching)
  await Instructor.updateOne(
    { _id: instructor._id },
    { $set: { schoolId: school._id, role: 'owner', isTeaching: false } }
  );

  // Link Sarah Johnson as a school instructor
  const sarahInstructor = createdInstructors.find((i: any) => i.email === 'sarah.johnson@example.com');
  if (sarahInstructor) {
    await Instructor.updateOne(
      { _id: sarahInstructor._id },
      { $set: { schoolId: school._id, role: 'instructor', isTeaching: true } }
    );
  }

  // Link Priya Patel as a school admin
  const priyaInstructor = createdInstructors.find((i: any) => i.email === 'priya.patel@example.com');
  if (priyaInstructor) {
    await Instructor.updateOne(
      { _id: priyaInstructor._id },
      { $set: { schoolId: school._id, role: 'admin', isTeaching: false } }
    );
  }
  console.log('🏫 Created school and linked 3 members (owner, admin, instructor)');

  // Create vehicles for the school
  const vehicles = await VehicleModel.insertMany([
    {
      schoolId: school._id,
      make: 'Ford',
      model: 'Fiesta',
      year: 2022,
      registration: 'AB12 CDE',
      transmission: 'manual',
      color: 'White',
      hasLearnerDualControls: true,
      status: 'active',
      insuranceExpiry: new Date('2025-12-31'),
      motExpiry: new Date('2025-06-15'),
    },
    {
      schoolId: school._id,
      make: 'Toyota',
      model: 'Yaris',
      year: 2023,
      registration: 'FG23 HIJ',
      transmission: 'automatic',
      color: 'Silver',
      hasLearnerDualControls: true,
      status: 'active',
      insuranceExpiry: new Date('2025-11-30'),
      motExpiry: new Date('2025-08-20'),
    },
    {
      schoolId: school._id,
      make: 'Vauxhall',
      model: 'Corsa',
      year: 2021,
      registration: 'KL21 MNO',
      transmission: 'manual',
      color: 'Red',
      hasLearnerDualControls: true,
      status: 'maintenance',
      notes: 'Dual controls being serviced',
    },
  ]);
  console.log(`🚗 Created ${vehicles.length} vehicles`);

  // Assign vehicles to instructors
  const assignments = [
    {
      vehicleId: vehicles[0]._id,
      instructorId: instructor._id,
      schoolId: school._id,
      isPrimary: true,
      status: 'active',
    },
    {
      vehicleId: vehicles[1]._id,
      instructorId: sarahInstructor?._id,
      schoolId: school._id,
      isPrimary: true,
      status: 'active',
    },
  ].filter((a) => a.instructorId);

  await VehicleAssignmentModel.insertMany(assignments);
  console.log(`📋 Created ${assignments.length} vehicle assignments`);

  // Create learners
  const learners = await Learner.insertMany([
    {
      instructorId: instructor._id,
      email: 'emma.wilson@example.com',
      firstName: 'Emma',
      lastName: 'Wilson',
      phone: '07700 900001',
      status: 'active',
      balance: -90, // Owes £90
      totalLessons: 5,
      completedLessons: 4,
    },
    {
      instructorId: instructor._id,
      email: 'james.brown@example.com',
      firstName: 'James',
      lastName: 'Brown',
      phone: '07700 900002',
      status: 'active',
      balance: 0,
      totalLessons: 10,
      completedLessons: 10,
    },
    {
      instructorId: instructor._id,
      email: 'sophie.taylor@example.com',
      firstName: 'Sophie',
      lastName: 'Taylor',
      phone: '07700 900003',
      status: 'active',
      balance: -180, // Owes £180
      totalLessons: 8,
      completedLessons: 6,
    },
  ]);
  console.log(`👥 Created ${learners.length} learners`);

  // ── Create historical completed lessons (past 6 months) ──────────────
  const lessons: any[] = [];
  const now = new Date();
  const lessonTypes = ['standard', 'test-prep', 'mock-test', 'motorway', 'refresher'];
  const pickupLocations = ['123 Main Street', '45 High Road', '78 Park Avenue', '12 Station Road'];
  const prices = [85, 90, 95, 100, 110];

  // Generate ~3-5 lessons per week for the past 26 weeks (6 months)
  for (let weeksAgo = 26; weeksAgo >= 1; weeksAgo--) {
    const lessonsThisWeek = 3 + Math.floor(Math.random() * 3); // 3-5 lessons

    for (let j = 0; j < lessonsThisWeek; j++) {
      const dayInWeek = Math.floor(Math.random() * 5); // Mon–Fri
      const hour = 9 + Math.floor(Math.random() * 7); // 9am–3pm start

      const startTime = new Date(now);
      startTime.setDate(now.getDate() - weeksAgo * 7 + dayInWeek);
      startTime.setHours(hour, 0, 0, 0);

      const duration = [60, 90, 120][Math.floor(Math.random() * 3)];
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + duration);

      const completedAt = new Date(endTime);
      completedAt.setMinutes(completedAt.getMinutes() + 5); // completed shortly after end

      const learner = learners[Math.floor(Math.random() * learners.length)];
      const isCancelled = Math.random() < 0.08; // ~8% cancellation rate
      const isNoShow = !isCancelled && Math.random() < 0.03; // ~3% no-show rate
      const price = prices[Math.floor(Math.random() * prices.length)];

      lessons.push({
        instructorId: instructor._id,
        learnerId: learner._id,
        startTime,
        endTime,
        duration,
        type: lessonTypes[Math.floor(Math.random() * lessonTypes.length)],
        status: isCancelled ? 'cancelled' : isNoShow ? 'no-show' : 'completed',
        paymentStatus: isCancelled
          ? 'refunded'
          : Math.random() < 0.85
          ? 'paid'
          : 'pending',
        price,
        pickupLocation: pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
        notes: `Week ${27 - weeksAgo} lesson`,
        ...(isCancelled
          ? { cancelledAt: new Date(startTime.getTime() - 24 * 60 * 60 * 1000), cancelledBy: 'learner' }
          : isNoShow
          ? {}
          : { completedAt }),
      });
    }
  }

  // ── Today's lessons ────────────────────────────────────────────────────
  const todaySlots = [
    { hour: 9, type: 'standard', status: 'completed' as const },
    { hour: 11, type: 'test-prep', status: 'completed' as const },
    { hour: 14, type: 'standard', status: 'scheduled' as const },
    { hour: 16, type: 'mock-test', status: 'scheduled' as const },
  ];

  for (const slot of todaySlots) {
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);

    const learner = learners[Math.floor(Math.random() * learners.length)];
    const isCompleted = slot.status === 'completed';
    const completedAt = isCompleted ? new Date(endTime.getTime() + 5 * 60 * 1000) : undefined;

    lessons.push({
      instructorId: instructor._id,
      learnerId: learner._id,
      startTime,
      endTime,
      duration: 120,
      type: slot.type,
      status: slot.status,
      paymentStatus: isCompleted ? 'paid' : 'pending',
      price: 90,
      pickupLocation: '123 Main Street',
      notes: `Today's ${slot.type} lesson`,
      ...(completedAt ? { completedAt } : {}),
    });
  }

  // ── Upcoming lessons (next 2 weeks) ────────────────────────────────────
  for (let i = 1; i <= 10; i++) {
    const dayOffset = Math.ceil(i / 2);
    const isAfternoon = i % 2 === 1;

    const startTime = new Date(now);
    startTime.setDate(now.getDate() + dayOffset);
    startTime.setHours(isAfternoon ? 14 : 10, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);

    const learner = learners[i % learners.length];

    lessons.push({
      instructorId: instructor._id,
      learnerId: learner._id,
      startTime,
      endTime,
      duration: 120,
      type: lessonTypes[i % lessonTypes.length],
      status: 'scheduled',
      paymentStatus: 'pending',
      price: 90,
      pickupLocation: pickupLocations[i % pickupLocations.length],
      notes: `Upcoming lesson ${i}`,
    });
  }

  await Lesson.insertMany(lessons);
  console.log(`📚 Created ${lessons.length} lessons (${lessons.filter(l => l.status === 'completed').length} completed, ${lessons.filter(l => l.status === 'scheduled').length} upcoming)`);

  // Create weekly availability
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const availability = daysOfWeek.map((day) => ({
    instructorId: instructor._id,
    dayOfWeek: day,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
    isAvailable: true,
  }));

  await WeeklyAvailability.insertMany(availability);
  // Create packages for solo instructor (John's personal ones)
  const packages = await Package.insertMany([
    {
      instructorId: instructor._id,
      name: 'Beginner Package',
      description: 'Perfect for complete beginners. Includes 5 lessons to get you started.',
      lessonCount: 5,
      price: 200,
      discountPercent: 10,
      isActive: true,
    },
    {
      instructorId: instructor._id,
      name: 'Standard Package',
      description: 'Our most popular package. 10 lessons with a great discount.',
      lessonCount: 10,
      price: 380,
      discountPercent: 15,
      isActive: true,
    },
    {
      instructorId: instructor._id,
      name: 'Intensive Package',
      description: 'Fast-track your learning with 20 lessons. Best value!',
      lessonCount: 20,
      price: 720,
      discountPercent: 20,
      isActive: true,
    },
  ]);

  // Create school-level packages (visible to all school instructors)
  const schoolPackages = await Package.insertMany([
    {
      schoolId: school._id,
      name: 'School Starter Pack',
      description: '5 lessons at school rates. Great for getting started.',
      lessonCount: 5,
      price: 210,
      discountPercent: 8,
      isActive: true,
    },
    {
      schoolId: school._id,
      name: 'School Standard Pack',
      description: '10 lessons at school rates. Our most popular school package.',
      lessonCount: 10,
      price: 400,
      discountPercent: 12,
      isActive: true,
    },
    {
      schoolId: school._id,
      name: 'School Intensive Pack',
      description: '20 lessons block booking. Best value at school rates.',
      lessonCount: 20,
      price: 750,
      discountPercent: 18,
      isActive: true,
    },
  ]);
  console.log(`📦 Created ${packages.length} personal + ${schoolPackages.length} school packages`);

  console.log('📅 Created weekly availability');

  // ============================================================================
  // Seed default DVSA syllabus + learner progress
  // ============================================================================

  const SyllabusModel = mongoose.model(
    'Syllabus',
    new mongoose.Schema(
      {
        instructorId: mongoose.Schema.Types.ObjectId,
        schoolId: mongoose.Schema.Types.ObjectId,
        name: String,
        description: String,
        isDefault: Boolean,
        topics: [
          {
            order: Number,
            title: String,
            description: String,
            category: String,
            keySkills: [String],
          },
        ],
      },
      { timestamps: true },
    ),
  );

  const LearnerProgressModel = mongoose.model(
    'LearnerProgress',
    new mongoose.Schema(
      {
        learnerId: mongoose.Schema.Types.ObjectId,
        instructorId: mongoose.Schema.Types.ObjectId,
        syllabusId: mongoose.Schema.Types.ObjectId,
        topicProgress: [
          {
            topicOrder: Number,
            status: { type: String, default: 'not-started' },
            currentScore: { type: Number, default: 0 },
            attempts: { type: Number, default: 0 },
            history: [
              {
                lessonId: mongoose.Schema.Types.ObjectId,
                date: Date,
                score: Number,
                notes: String,
              },
            ],
            completedAt: Date,
          },
        ],
      },
      { timestamps: true },
    ),
  );

  // Clear existing syllabus and progress
  await SyllabusModel.deleteMany({});
  await LearnerProgressModel.deleteMany({});

  // Import and seed the default syllabus
  const { DEFAULT_DVSA_SYLLABUS } = await import('../modules/syllabus/default-syllabus');

  const syllabus = await SyllabusModel.create({
    ...DEFAULT_DVSA_SYLLABUS,
    instructorId: instructor._id,
    isDefault: true,
  });
  console.log(`📋 Created DVSA syllabus with ${syllabus.topics.length} topics`);

  // Create school-level DVSA syllabus
  await SyllabusModel.create({
    ...DEFAULT_DVSA_SYLLABUS,
    schoolId: school._id,
    isDefault: true,
  });
  console.log('📋 Created school DVSA syllabus');

  // Create progress for each learner with some realistic scores
  const allLearners = await Learner.find({ instructorId: instructor._id });
  for (const learner of allLearners) {
    // Simulate varied progress: first learner more advanced, others less
    const learnerIdx = allLearners.indexOf(learner);
    const topicsCompleted = Math.max(0, Math.floor((37 - learnerIdx * 10) * 0.5));

    const topicProgress = syllabus.topics.map((t: any) => {
      const order = t.order;
      if (order <= topicsCompleted) {
        // Completed topics
        return {
          topicOrder: order,
          status: 'completed',
          currentScore: 4 + Math.floor(Math.random() * 2), // 4 or 5
          attempts: 1 + Math.floor(Math.random() * 3),
          history: [
            {
              date: new Date(Date.now() - (37 - order) * 7 * 86400000),
              score: 4 + Math.floor(Math.random() * 2),
              notes: 'Good progress',
            },
          ],
          completedAt: new Date(Date.now() - (37 - order) * 7 * 86400000),
        };
      } else if (order <= topicsCompleted + 2) {
        // In-progress topics (next 2)
        return {
          topicOrder: order,
          status: 'in-progress',
          currentScore: 2 + Math.floor(Math.random() * 2), // 2 or 3
          attempts: 1 + Math.floor(Math.random() * 2),
          history: [
            {
              date: new Date(Date.now() - 3 * 86400000),
              score: 2 + Math.floor(Math.random() * 2),
              notes: 'Needs more practice',
            },
          ],
        };
      } else {
        // Not started
        return {
          topicOrder: order,
          status: 'not-started',
          currentScore: 0,
          attempts: 0,
          history: [],
        };
      }
    });

    await LearnerProgressModel.create({
      learnerId: learner._id,
      instructorId: instructor._id,
      syllabusId: syllabus._id,
      topicProgress,
    });
  }
  console.log(`📊 Created progress records for ${allLearners.length} learners`);

  // ============================================================================
  // Seed learners, lessons, links, and progress for Sarah (school instructor)
  // ============================================================================

  const LearnerInstructorLinkModel = mongoose.model(
    'LearnerInstructorLink',
    new mongoose.Schema(
      {
        learnerId: mongoose.Schema.Types.ObjectId,
        instructorId: mongoose.Schema.Types.ObjectId,
        balance: { type: Number, default: 0 },
        totalLessons: { type: Number, default: 0 },
        completedLessons: { type: Number, default: 0 },
        cancelledLessons: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        status: { type: String, default: 'active' },
        testReadiness: String,
        testReadinessComment: String,
        testReadinessUpdatedAt: Date,
        instructorNotes: String,
        defaultPickupLocation: String,
        startedAt: Date,
        lastLessonAt: Date,
      },
      { timestamps: true },
    ),
  );

  // Also create links for John's existing learners
  for (const learner of allLearners) {
    await LearnerInstructorLinkModel.create({
      learnerId: learner._id,
      instructorId: instructor._id,
      totalLessons: learner.totalLessons,
      completedLessons: learner.completedLessons,
      totalSpent: learner.completedLessons * 9000, // ~£90 per lesson in pence
      status: 'active',
      startedAt: new Date(Date.now() - 180 * 86400000),
      lastLessonAt: new Date(Date.now() - 86400000),
    });
  }

  if (sarahInstructor) {
    const sarahOid = sarahInstructor._id;

    // Create 2 learners for Sarah
    const sarahLearners = await Learner.insertMany([
      {
        instructorId: sarahOid,
        email: 'oliver.jones@example.com',
        firstName: 'Oliver',
        lastName: 'Jones',
        phone: '07700 900010',
        status: 'active',
        balance: 0,
        totalLessons: 15,
        completedLessons: 12,
      },
      {
        instructorId: sarahOid,
        email: 'amelia.clark@example.com',
        firstName: 'Amelia',
        lastName: 'Clark',
        phone: '07700 900011',
        status: 'active',
        balance: -4500,
        totalLessons: 8,
        completedLessons: 6,
      },
    ]);

    // Create lessons for Sarah's learners
    const sarahLessons: any[] = [];
    for (let weeksAgo = 16; weeksAgo >= 1; weeksAgo--) {
      const lessonsThisWeek = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < lessonsThisWeek; j++) {
        const dayInWeek = Math.floor(Math.random() * 5);
        const hour = 9 + Math.floor(Math.random() * 7);
        const startTime = new Date(now);
        startTime.setDate(now.getDate() - weeksAgo * 7 + dayInWeek);
        startTime.setHours(hour, 0, 0, 0);
        const duration = [60, 90][Math.floor(Math.random() * 2)];
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + duration);
        const learner = sarahLearners[Math.floor(Math.random() * sarahLearners.length)];
        const isCancelled = Math.random() < 0.05;
        sarahLessons.push({
          instructorId: sarahOid,
          learnerId: learner._id,
          startTime,
          endTime,
          duration,
          type: lessonTypes[Math.floor(Math.random() * lessonTypes.length)],
          status: isCancelled ? 'cancelled' : 'completed',
          paymentStatus: isCancelled ? 'refunded' : 'paid',
          price: prices[Math.floor(Math.random() * prices.length)],
          pickupLocation: pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
        });
      }
    }
    await Lesson.insertMany(sarahLessons);

    // Create learner-instructor links for Sarah's learners
    await LearnerInstructorLinkModel.insertMany([
      {
        learnerId: sarahLearners[0]._id,
        instructorId: sarahOid,
        totalLessons: 15,
        completedLessons: 12,
        cancelledLessons: 1,
        totalSpent: 12 * 9000,
        status: 'active',
        testReadiness: 'nearly-ready',
        testReadinessComment: 'Good progress, needs a few more motorway sessions',
        startedAt: new Date(Date.now() - 120 * 86400000),
        lastLessonAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        learnerId: sarahLearners[1]._id,
        instructorId: sarahOid,
        totalLessons: 8,
        completedLessons: 6,
        cancelledLessons: 0,
        totalSpent: 6 * 9000,
        status: 'active',
        testReadiness: 'not-ready',
        testReadinessComment: 'Still building confidence with junctions',
        startedAt: new Date(Date.now() - 60 * 86400000),
        lastLessonAt: new Date(Date.now() - 5 * 86400000),
      },
    ]);

    // Get school syllabus for progress records
    const schoolSyllabus = await SyllabusModel.findOne({ schoolId: school._id });
    if (schoolSyllabus) {
      for (let idx = 0; idx < sarahLearners.length; idx++) {
        const learner = sarahLearners[idx];
        const topicsCompleted = Math.max(0, Math.floor((37 - idx * 12) * 0.5));
        const topicProgress = schoolSyllabus.topics.map((t: any) => {
          const order = t.order;
          if (order <= topicsCompleted) {
            return {
              topicOrder: order,
              status: 'completed',
              currentScore: 4 + Math.floor(Math.random() * 2),
              attempts: 1 + Math.floor(Math.random() * 3),
              history: [{ date: new Date(Date.now() - (37 - order) * 5 * 86400000), score: 4 + Math.floor(Math.random() * 2), notes: 'Good progress' }],
              completedAt: new Date(Date.now() - (37 - order) * 5 * 86400000),
            };
          } else if (order <= topicsCompleted + 3) {
            return {
              topicOrder: order,
              status: 'in-progress',
              currentScore: 2 + Math.floor(Math.random() * 2),
              attempts: 1 + Math.floor(Math.random() * 2),
              history: [{ date: new Date(Date.now() - 4 * 86400000), score: 2 + Math.floor(Math.random() * 2), notes: 'Needs practice' }],
            };
          } else {
            return { topicOrder: order, status: 'not-started', currentScore: 0, attempts: 0, history: [] };
          }
        });
        await LearnerProgressModel.create({
          learnerId: learner._id,
          instructorId: sarahOid,
          syllabusId: schoolSyllabus._id,
          topicProgress,
        });
      }
    }
    console.log(`📊 Created Sarah's learners: ${sarahLearners.length} learners, ${sarahLessons.length} lessons, with links & progress`);
  }

  await mongoose.disconnect();
  console.log('✅ Seed completed!');
  console.log('\n📧 Login credentials:');
  console.log('   Email: instructor@example.com');
  console.log('   Password: password123');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
