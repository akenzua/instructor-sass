import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instructor-saas';

async function fix() {
  await mongoose.connect(MONGODB_URI);
  console.log('📦 Connected to MongoDB');

  const db = mongoose.connection.db;

  // Get the instructor with email instructor@example.com
  const instructor = await db
    .collection('instructors')
    .findOne({ email: 'instructor@example.com' });

  if (!instructor) {
    console.error('❌ Instructor not found!');
    process.exit(1);
  }

  console.log(`\n👨‍🏫 Found instructor: ${instructor.email} (ID: ${instructor._id})`);

  // Update all packages to belong to this instructor
  const result = await db
    .collection('packages')
    .updateMany({}, { $set: { instructorId: instructor._id } });

  console.log(`\n✅ Updated ${result.modifiedCount} packages to instructorId: ${instructor._id}`);

  await mongoose.disconnect();
}

fix().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});
