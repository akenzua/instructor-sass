import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instructor-saas';

async function debug() {
  await mongoose.connect(MONGODB_URI);
  console.log('📦 Connected to MongoDB');

  const db = mongoose.connection.db;

  // Get all instructors
  const instructors = await db.collection('instructors').find({}).toArray();
  console.log('\n👨‍🏫 Instructors in database:');
  instructors.forEach((instructor) => {
    console.log(`  - ${instructor.email} (ID: ${instructor._id})`);
  });

  // Get all packages
  const packages = await db.collection('packages').find({}).toArray();
  console.log(`\n📦 Packages in database (${packages.length} total):`);
  packages.forEach((pkg) => {
    console.log(`  - ${pkg.name} (instructorId: ${pkg.instructorId})`);
  });

  await mongoose.disconnect();
}

debug().catch((err) => {
  console.error('❌ Debug failed:', err);
  process.exit(1);
});
