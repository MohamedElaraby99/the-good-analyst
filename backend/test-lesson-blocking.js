import mongoose from 'mongoose';
import { checkLessonAccess } from './utils/lessonProgression.js';
import Course from './models/course.model.js';
import ExamResult from './models/examResult.model.js';
import User from './models/user.model.js';

// Test the lesson blocking system
async function testLessonBlocking() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database');
    console.log('✅ Connected to MongoDB');

    // Find a test course with multiple lessons
    const course = await Course.findOne({
      $or: [
        { 'directLessons.1': { $exists: true } },
        { 'units.lessons.1': { $exists: true } }
      ]
    }).populate('instructor stage subject');
    
    if (!course) {
      console.log('❌ No courses with multiple lessons found in database');
      return;
    }

    console.log(`📚 Testing with course: ${course.title}`);

    // Find a test user
    const user = await User.findOne({ role: 'USER' });
    if (!user) {
      console.log('❌ No regular users found in database');
      return;
    }

    console.log(`👤 Testing with user: ${user.fullName}`);

    // Test direct lessons progression
    if (course.directLessons && course.directLessons.length > 1) {
      console.log('\n🔍 Testing Direct Lessons Progression:');
      
      const firstLesson = course.directLessons[0];
      const secondLesson = course.directLessons[1];
      
      console.log(`   Lesson 1: ${firstLesson.title}`);
      console.log(`   Lesson 2: ${secondLesson.title}`);
      
      // Test first lesson access (should be allowed)
      const firstAccess = await checkLessonAccess(
        user._id.toString(), 
        course._id.toString(), 
        firstLesson._id.toString()
      );
      console.log(`   ✅ First lesson access: ${firstAccess.hasAccess ? 'ALLOWED' : 'BLOCKED'}`);
      
      // Test second lesson access (should be blocked if no exam passed)
      const secondAccess = await checkLessonAccess(
        user._id.toString(), 
        course._id.toString(), 
        secondLesson._id.toString()
      );
      console.log(`   ${secondAccess.hasAccess ? '✅' : '❌'} Second lesson access: ${secondAccess.hasAccess ? 'ALLOWED' : 'BLOCKED'}`);
      if (!secondAccess.hasAccess) {
        console.log(`   📝 Reason: ${secondAccess.reason}`);
        console.log(`   📋 Required exam in: ${secondAccess.requiredExam?.lessonTitle}`);
      }
    }

    // Test units progression
    if (course.units && course.units.length > 0) {
      console.log('\n🔍 Testing Units Progression:');
      
      for (let unitIndex = 0; unitIndex < course.units.length; unitIndex++) {
        const unit = course.units[unitIndex];
        console.log(`   📁 Unit ${unitIndex + 1}: ${unit.title}`);
        
        if (unit.lessons && unit.lessons.length > 0) {
          const firstLesson = unit.lessons[0];
          
          // Test first lesson access in this unit
          const firstAccess = await checkLessonAccess(
            user._id.toString(), 
            course._id.toString(), 
            firstLesson._id.toString(),
            unit._id.toString()
          );
          console.log(`     ${firstAccess.hasAccess ? '✅' : '❌'} First lesson access: ${firstAccess.hasAccess ? 'ALLOWED' : 'BLOCKED'}`);
          if (!firstAccess.hasAccess) {
            console.log(`     📝 Reason: ${firstAccess.reason}`);
            if (firstAccess.requiredExam?.unitTitle) {
              console.log(`     📋 Required: Complete "${firstAccess.requiredExam.unitTitle}"`);
            }
          }
          
          // Test second lesson if it exists
          if (unit.lessons.length > 1) {
            const secondLesson = unit.lessons[1];
            const secondAccess = await checkLessonAccess(
              user._id.toString(), 
              course._id.toString(), 
              secondLesson._id.toString(),
              unit._id.toString()
            );
            console.log(`     ${secondAccess.hasAccess ? '✅' : '❌'} Second lesson access: ${secondAccess.hasAccess ? 'ALLOWED' : 'BLOCKED'}`);
            if (!secondAccess.hasAccess) {
              console.log(`     📝 Reason: ${secondAccess.reason}`);
              console.log(`     📋 Required exam in: ${secondAccess.requiredExam?.lessonTitle}`);
            }
          }
        }
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - First lessons should always be accessible');
    console.log('   - Subsequent lessons should be blocked until exam is passed');
    console.log('   - Units should be blocked until previous units are completed');
    console.log('   - System should provide clear reasons for blocked access');
    console.log('   - Exam results are now checked from course model userAttempts');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLessonBlocking();
