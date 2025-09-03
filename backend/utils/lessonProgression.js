import ExamResult from '../models/examResult.model.js';
import Course from '../models/course.model.js';

/**
 * Check if a user has access to a specific lesson based on exam progression
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {string} unitId - Unit ID (optional, for lessons within units)
 * @returns {Promise<{hasAccess: boolean, reason?: string, requiredExam?: object}>}
 */
export const checkLessonAccess = async (userId, courseId, lessonId, unitId = null) => {
  try {
    // Get the course to understand the lesson structure
    const course = await Course.findById(courseId);
    if (!course) {
      return { hasAccess: false, reason: 'Course not found' };
    }

    let lesson = null;
    let unit = null;
    let lessonIndex = -1;
    let allLessons = [];
    let unitIndex = -1;

    // Find the lesson and determine its position
    if (unitId) {
      // Lesson is within a unit
      unit = course.units.id(unitId);
      if (!unit) {
        return { hasAccess: false, reason: 'Unit not found' };
      }
      lesson = unit.lessons.id(lessonId);
      if (!lesson) {
        return { hasAccess: false, reason: 'Lesson not found' };
      }
      lessonIndex = unit.lessons.findIndex(l => l._id.toString() === lessonId);
      unitIndex = course.units.findIndex(u => u._id.toString() === unitId);
      allLessons = unit.lessons;
    } else {
      // Direct lesson
      lesson = course.directLessons.id(lessonId);
      if (!lesson) {
        return { hasAccess: false, reason: 'Lesson not found' };
      }
      lessonIndex = course.directLessons.findIndex(l => l._id.toString() === lessonId);
      allLessons = course.directLessons;
    }

    // Check if this is the very first lesson in the entire course
    const isFirstLessonInCourse = await checkIfFirstLessonInCourse(course, unitId, lessonIndex);
    if (isFirstLessonInCourse) {
      return { hasAccess: true };
    }

    // Check if direct lessons are completed before accessing units
    if (unitId && course.directLessons && course.directLessons.length > 0) {
      const directLessonsCompleted = await checkDirectLessonsCompletion(userId, courseId, course.directLessons);
      if (!directLessonsCompleted) {
        return {
          hasAccess: false,
          reason: 'You must complete all direct lessons before accessing units',
          requiredExam: {
            unitId: null,
            unitTitle: 'Direct Lessons',
            lessonId: null,
            lessonTitle: null
          }
        };
      }
    }

    // Check cross-unit progression for units
    if (unitId && unitIndex > 0) {
      // Check if all previous units are completed
      for (let i = 0; i < unitIndex; i++) {
        const previousUnit = course.units[i];
        const isUnitCompleted = await checkUnitCompletion(userId, courseId, previousUnit);
        if (!isUnitCompleted) {
          return {
            hasAccess: false,
            reason: `يجب أن تمتحن "${previousUnit.title}" قبل الوصول إلى هذه الوحدة`,
            requiredExam: {
              unitId: previousUnit._id.toString(),
              unitTitle: previousUnit.title,
              lessonId: null,
              lessonTitle: null
            }
          };
        }
      }
    }

    // Check if previous lesson has a passed exam (within the same unit)
    const previousLesson = allLessons[lessonIndex - 1];
    if (!previousLesson) {
      return { hasAccess: true }; // No previous lesson, allow access
    }

    // Check if previous lesson has any exams
    const hasExams = (previousLesson.exams && previousLesson.exams.length > 0) || 
                     (previousLesson.trainings && previousLesson.trainings.length > 0);

    if (!hasExams) {
      // No exams in previous lesson, allow access
      return { hasAccess: true };
    }

    // Check if user has passed any exam in the previous lesson (from course model)
    let hasPassedPreviousExam = false;
    
    // Check exams in previous lesson
    if (previousLesson.exams && previousLesson.exams.length > 0) {
      for (const exam of previousLesson.exams) {
        const userAttempt = exam.userAttempts.find(attempt => 
          attempt.userId.toString() === userId.toString()
        );
        if (userAttempt) {
          const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
          if (percentage >= 50) { // Assuming 50% is passing
            hasPassedPreviousExam = true;
            break;
          }
        }
      }
    }
    
    // Check trainings in previous lesson
    if (!hasPassedPreviousExam && previousLesson.trainings && previousLesson.trainings.length > 0) {
      for (const training of previousLesson.trainings) {
        const userAttempt = training.userAttempts.find(attempt => 
          attempt.userId.toString() === userId.toString()
        );
        if (userAttempt) {
          const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
          if (percentage >= 50) { // Assuming 50% is passing
            hasPassedPreviousExam = true;
            break;
          }
        }
      }
    }

    if (!hasPassedPreviousExam) {
      // User hasn't passed any exam in previous lesson
      return { 
        hasAccess: false, 
        reason: 'You must pass the exam in the previous lesson to access this content',
        requiredExam: {
          lessonId: previousLesson._id.toString(),
          lessonTitle: previousLesson.title,
          unitId: unitId,
          unitTitle: unit?.title || null
        }
      };
    }

    // User has passed at least one exam in previous lesson
    return { hasAccess: true };

  } catch (error) {
    console.error('Error checking lesson access:', error);
    return { hasAccess: false, reason: 'Error checking access permissions' };
  }
};

/**
 * Check if this is the very first lesson in the entire course
 * @param {object} course - Course object
 * @param {string} unitId - Unit ID (null for direct lessons)
 * @param {number} lessonIndex - Lesson index within unit/direct lessons
 * @returns {Promise<boolean>}
 */
const checkIfFirstLessonInCourse = async (course, unitId, lessonIndex) => {
  // If there are direct lessons, the first direct lesson is the first lesson in course
  if (course.directLessons && course.directLessons.length > 0) {
    return !unitId && lessonIndex === 0;
  }
  
  // If no direct lessons, the first lesson of the first unit is the first lesson
  if (course.units && course.units.length > 0) {
    return unitId && lessonIndex === 0;
  }
  
  return false;
};

/**
 * Check if all direct lessons are completed
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {Array} directLessons - Array of direct lessons
 * @returns {Promise<boolean>}
 */
const checkDirectLessonsCompletion = async (userId, courseId, directLessons) => {
  try {
    // Check each direct lesson
    for (const lesson of directLessons) {
      // Check if lesson has exams
      const hasExams = (lesson.exams && lesson.exams.length > 0) || 
                       (lesson.trainings && lesson.trainings.length > 0);

      if (hasExams) {
        // Check if user has passed any exam in this lesson (from course model)
        let hasPassedExam = false;
        
        // Check exams
        if (lesson.exams && lesson.exams.length > 0) {
          for (const exam of lesson.exams) {
            const userAttempt = exam.userAttempts.find(attempt => 
              attempt.userId.toString() === userId.toString()
            );
            if (userAttempt) {
              const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
              if (percentage >= 50) { // Assuming 50% is passing
                hasPassedExam = true;
                break;
              }
            }
          }
        }
        
        // Check trainings
        if (!hasPassedExam && lesson.trainings && lesson.trainings.length > 0) {
          for (const training of lesson.trainings) {
            const userAttempt = training.userAttempts.find(attempt => 
              attempt.userId.toString() === userId.toString()
            );
            if (userAttempt) {
              const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
              if (percentage >= 50) { // Assuming 50% is passing
                hasPassedExam = true;
                break;
              }
            }
          }
        }

        if (!hasPassedExam) {
          // User hasn't passed any exam in this lesson
          return false;
        }
      }
    }

    // All direct lessons with exams have been passed
    return true;
  } catch (error) {
    console.error('Error checking direct lessons completion:', error);
    return false;
  }
};

/**
 * Check if a unit is completed (all lessons with exams have been passed)
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {object} unit - Unit object
 * @returns {Promise<boolean>}
 */
const checkUnitCompletion = async (userId, courseId, unit) => {
  try {
    // Check each lesson in the unit
    for (const lesson of unit.lessons) {
      // Check if lesson has exams
      const hasExams = (lesson.exams && lesson.exams.length > 0) || 
                       (lesson.trainings && lesson.trainings.length > 0);

      if (hasExams) {
        // Check if user has passed any exam in this lesson (from course model)
        let hasPassedExam = false;
        
        // Check exams
        if (lesson.exams && lesson.exams.length > 0) {
          for (const exam of lesson.exams) {
            const userAttempt = exam.userAttempts.find(attempt => 
              attempt.userId.toString() === userId.toString()
            );
            if (userAttempt) {
              const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
              if (percentage >= 50) { // Assuming 50% is passing
                hasPassedExam = true;
                break;
              }
            }
          }
        }
        
        // Check trainings
        if (!hasPassedExam && lesson.trainings && lesson.trainings.length > 0) {
          for (const training of lesson.trainings) {
            const userAttempt = training.userAttempts.find(attempt => 
              attempt.userId.toString() === userId.toString()
            );
            if (userAttempt) {
              const percentage = Math.round((userAttempt.score / userAttempt.totalQuestions) * 100);
              if (percentage >= 50) { // Assuming 50% is passing
                hasPassedExam = true;
                break;
              }
            }
          }
        }
        
        if (!hasPassedExam) {
          // User hasn't passed any exam in this lesson
          return false;
        }
      }
    }

    // All lessons with exams have been passed
    return true;
  } catch (error) {
    console.error('Error checking unit completion:', error);
    return false;
  }
};

/**
 * Get lesson progression status for a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{units: Array, directLessons: Array}>}
 */
export const getLessonProgression = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const result = {
      units: [],
      directLessons: []
    };

    // Process units
    for (const unit of course.units) {
      const unitData = {
        _id: unit._id,
        title: unit.title,
        description: unit.description,
        lessons: []
      };

      for (let i = 0; i < unit.lessons.length; i++) {
        const lesson = unit.lessons[i];
        const accessCheck = await checkLessonAccess(userId, courseId, lesson._id.toString(), unit._id.toString());
        
        unitData.lessons.push({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          hasAccess: accessCheck.hasAccess,
          accessReason: accessCheck.reason,
          requiredExam: accessCheck.requiredExam,
          isFirstLesson: i === 0,
          hasExams: (lesson.exams && lesson.exams.length > 0) || (lesson.trainings && lesson.trainings.length > 0)
        });
      }

      result.units.push(unitData);
    }

    // Process direct lessons
    for (let i = 0; i < course.directLessons.length; i++) {
      const lesson = course.directLessons[i];
      const accessCheck = await checkLessonAccess(userId, courseId, lesson._id.toString());
      
      result.directLessons.push({
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        price: lesson.price,
        hasAccess: accessCheck.hasAccess,
        accessReason: accessCheck.reason,
        requiredExam: accessCheck.requiredExam,
        isFirstLesson: i === 0,
        hasExams: (lesson.exams && lesson.exams.length > 0) || (lesson.trainings && lesson.trainings.length > 0)
      });
    }

    return result;

  } catch (error) {
    console.error('Error getting lesson progression:', error);
    throw error;
  }
};

/**
 * Check if user can access lesson content (videos, PDFs, etc.)
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {string} unitId - Unit ID (optional)
 * @returns {Promise<boolean>}
 */
export const canAccessLessonContent = async (userId, courseId, lessonId, unitId = null) => {
  const accessCheck = await checkLessonAccess(userId, courseId, lessonId, unitId);
  return accessCheck.hasAccess;
};
