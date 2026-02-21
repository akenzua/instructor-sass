import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const WeeklyAvailabilitySchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  slots: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  isAvailable: { type: Boolean, required: true, default: true },
});

async function fixWeekendAvailability() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/instructor-sass';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const WeeklyAvailability = mongoose.model('WeeklyAvailability', WeeklyAvailabilitySchema);

    // Find all weekend records that are unavailable
    const weekendRecords = await WeeklyAvailability.find({
      dayOfWeek: { $in: ['saturday', 'sunday'] },
      isAvailable: false,
    });

    console.log(`\nFound ${weekendRecords.length} unavailable weekend records`);

    if (weekendRecords.length === 0) {
      console.log('No records to fix! ✨');
      await mongoose.disconnect();
      return;
    }

    // Update each record
    const defaultSlots = [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ];

    const result = await WeeklyAvailability.updateMany(
      {
        dayOfWeek: { $in: ['saturday', 'sunday'] },
        isAvailable: false,
      },
      {
        $set: {
          isAvailable: true,
          slots: defaultSlots,
        },
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} weekend records`);
    console.log('   - Set isAvailable to true');
    console.log('   - Added default slots (09:00-12:00, 13:00-17:00)');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n🎉 Weekend availability fixed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
fixWeekendAvailability();
