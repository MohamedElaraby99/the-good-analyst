import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../Helpers/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    allUsersCount: 0,
    subscribedCount: 0,
    totalCourses: 0,
    totalLectures: 0,
    totalPayments: 0,
    totalRevenue: 0,
    monthlySalesData: new Array(12).fill(0),
    recentPayments: [],
    recentCourses: []
};

// ......get stats data......
export const getStatsData = createAsyncThunk("stats/get", async () => {
    const loadingId = toast.loading("Getting the stats...")
    try {
        const response = await axiosInstance.get("/admin/stats/users");
        toast.success(response?.data?.message, { id: loadingId });
        return response?.data;
    } catch (error) {
        toast.error("Failed to get stats", { id: loadingId });
        throw error
    }
})

const statSlice = createSlice({
    name: "state",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getStatsData.fulfilled, (state, action) => {
            console.log('📊 Stats data received:', action?.payload);
            state.allUsersCount = action?.payload?.allUsersCount || 0;
            state.subscribedCount = action?.payload?.subscribedUsersCount || 0;
            state.totalCourses = action?.payload?.totalCourses || 0;
            state.totalLectures = action?.payload?.totalLectures || 0;
            state.totalPayments = action?.payload?.totalPayments || 0;
            state.totalRevenue = action?.payload?.totalRevenue || 0;
            state.monthlySalesData = action?.payload?.monthlySalesData || new Array(12).fill(0);
            state.recentPayments = action?.payload?.recentPayments || [];
            state.recentCourses = action?.payload?.recentCourses || [];
        })
    }
});

export default statSlice.reducer;