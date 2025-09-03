import {configureStore} from "@reduxjs/toolkit"
import AuthSliceReducer from "./Slices/AuthSlice"
import LectureSliceReducer from "./Slices/LectureSlice"
import StatSliceReducer from "./Slices/StatSlice"
import BlogSliceReducer from "./Slices/BlogSlice"
import QASliceReducer from "./Slices/QASlice"
import SubjectSliceReducer from "./Slices/SubjectSlice"
import WalletSliceReducer from "./Slices/WalletSlice"
import AdminRechargeCodeSliceReducer from "./Slices/AdminRechargeCodeSlice"
import AdminUserSliceReducer from "./Slices/AdminUserSlice"
import WhatsAppServiceSliceReducer from "./Slices/WhatsAppServiceSlice"
import CourseSliceReducer from "./Slices/CourseSlice"
import LessonPurchaseSliceReducer from "./Slices/LessonPurchaseSlice"
import ExamSliceReducer from "./Slices/ExamSlice"
import GradeSliceReducer from "./Slices/GradeSlice"
import InstructorSliceReducer from "./Slices/InstructorSlice"
import StageSliceReducer from "./Slices/StageSlice"
import PaymentSliceReducer from "./Slices/PaymentSlice"
import VideoProgressSliceReducer from "./Slices/VideoProgressSlice"
import DeviceManagementSliceReducer from "./Slices/DeviceManagementSlice"
import LiveMeetingSliceReducer from "./Slices/LiveMeetingSlice"
import CourseAccessSliceReducer from "./Slices/CourseAccessSlice"
import EssayExamSliceReducer from "./Slices/EssayExamSlice"

 const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,

    
        lecture: LectureSliceReducer,
        stat: StatSliceReducer,
        blog: BlogSliceReducer,
        qa: QASliceReducer,
        subject: SubjectSliceReducer,
        wallet: WalletSliceReducer,
        adminRechargeCode: AdminRechargeCodeSliceReducer,
        adminUser: AdminUserSliceReducer,
        whatsappService: WhatsAppServiceSliceReducer,
        course: CourseSliceReducer,

        lessonPurchase: LessonPurchaseSliceReducer,
        courseAccess: CourseAccessSliceReducer,
          exam: ExamSliceReducer,
  grade: GradeSliceReducer,
  instructor: InstructorSliceReducer,
  stage: StageSliceReducer,
  payment: PaymentSliceReducer,
  videoProgress: VideoProgressSliceReducer,
  deviceManagement: DeviceManagementSliceReducer,
  liveMeeting: LiveMeetingSliceReducer,
  essayExam: EssayExamSliceReducer
    },
    devTools: true
})

export default store