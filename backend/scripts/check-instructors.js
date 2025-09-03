import mongoose from 'mongoose';
import dotenv from 'dotenv';
import instructorModel from '../models/instructor.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const dbType = process.env.DB_TYPE || 'atlas';
    let uri;
    
    switch (dbType) {
      case 'atlas':
        uri = process.env.MONGO_URI_ATLAS;
        break;
      case 'compass':
        uri = process.env.MONGO_URI_COMPASS || 'mongodb://localhost:27017/thegoodanalysttabase';
        break;
      case 'community':
        uri = process.env.MONGO_URI_COMMUNITY;
        break;
      default:
        throw new Error(`Unknown database type: ${dbType}`);
    }
    
    if (!uri) {
      throw new Error(`No URI found for database type: ${dbType}`);
    }
    
    await mongoose.connect(uri);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const checkInstructors = async () => {
  try {
    await connectDB();
    
    const instructors = await instructorModel.find({});
    
    console.log(`\n📊 Found ${instructors.length} instructors in database:`);
    
    if (instructors.length === 0) {
      console.log('\n❌ No instructors found! You need to create some instructors first.');
      console.log('\n💡 To create an instructor, use the admin dashboard or create a script.');
    } else {
      instructors.forEach((instructor, index) => {
        console.log(`\n${index + 1}. ${instructor.name}`);
        console.log(`   - Specialization: ${instructor.specialization || 'N/A'}`);
        console.log(`   - Featured: ${instructor.featured ? 'Yes' : 'No'}`);
        console.log(`   - Rating: ${instructor.rating || 0}`);
        console.log(`   - Students: ${instructor.totalStudents || 0}`);
        console.log(`   - Active: ${instructor.isActive ? 'Yes' : 'No'}`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error checking instructors:', error);
    mongoose.connection.close();
  }
};

checkInstructors(); 