import apiClient from "./apiClient";

// Get all contacts (admin only)
export const getAllContacts = async (): Promise<any> => {
    const response = await apiClient.get("/contact/get-all-contacts", {
        withCredentials: true,
    });
    return response.data;
};

// Get all feedback (admin only)
export const getAllFeedback = async (): Promise<any> => {
    const response = await apiClient.get("/feedback/get-all-feedback", {
        withCredentials: true,
    });
    return response.data;
};

// Get dashboard summary stats
export const getDashboardStats = async (): Promise<any> => {
    try {
        const [orders, contacts, feedback, reservations, users] = await Promise.all([
            apiClient.get("/order/get-order-stats", { withCredentials: true }),
            getAllContacts(),
            getAllFeedback(),
            apiClient.get("/reservation/get-reservation-stats", { withCredentials: true }),
            apiClient.get("/user/get-all-users", { withCredentials: true }),
        ]);

        return {
            orders: orders.data,
            contacts: contacts.data || [],
            feedback: feedback.data || [],
            reservations: reservations.data,
            users: users.data,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            orders: {},
            contacts: [],
            feedback: [],
            reservations: {},
            users: [],
        };
    }
};
