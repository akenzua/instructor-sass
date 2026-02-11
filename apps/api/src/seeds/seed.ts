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
    name: String,
    description: String,
    lessonCount: Number,
    price: Number,
    discountPercent: Number,
    isActive: Boolean,
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

  // Clear existing data
  await Promise.all([
    Instructor.deleteMany({}),
    Learner.deleteMany({}),
    Lesson.deleteMany({}),
    WeeklyAvailability.deleteMany({}),
    Package.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data');

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
      lessonTypes: [
        { type: 'standard', price: 42, duration: 60, description: 'Standard lesson' },
        { type: 'intensive', price: 180, duration: 240, description: '4-hour intensive session' },
      ],
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

  // Create lessons for the next 2 weeks
  const lessons = [];
  const now = new Date();
  const lessonTypes = ['standard', 'test-prep', 'mock-test', 'motorway'];

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
      status: isPast ? 'completed' : 'scheduled',
      paymentStatus: i < 4 ? 'paid' : 'pending', // First 4 paid, rest pending
      price: 90,
      pickupLocation: '123 Main Street',
      notes: `Lesson ${i + 1} notes`,
    });
  }

  await Lesson.insertMany(lessons);
  console.log(`📚 Created ${lessons.length} lessons`);

  // Create weekly availability
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const availability = daysOfWeek.map((day) => ({
    instructorId: instructor._id,
    dayOfWeek: day,
    slots:
      day === 'saturday' || day === 'sunday'
        ? []
        : [
            { start: '09:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
    isAvailable: day !== 'saturday' && day !== 'sunday',
  }));

  await WeeklyAvailability.insertMany(availability);
  // Create packages
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
  console.log(`📦 Created ${packages.length} packages`);

  console.log('📅 Created weekly availability');

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
