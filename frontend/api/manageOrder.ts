import apiClient from "./apiClient";

export const getAllOrders = async (): Promise<any> => {
    const response = await apiClient.get("/order/get-all-orders", {
        withCredentials: true,
    });
    return response.data;
};

export const getOrderByUserId = async (): Promise<any> => {
    const response = await apiClient.get(`/order/get-order-by-user-id`, {
        withCredentials: true,
    });
    return response.data;
};

export const manageOrderStatus = async (id: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`/order/manage-order/${id}`, {
        status,
    },
        {
            withCredentials: true,
        },
    );
    return response.data;
};

export const cancelOrder = async (id: string): Promise<any> => {
    const response = await apiClient.patch(`/order/cancel-order/${id}`, {}, {
        withCredentials: true,
    });
    return response.data;
};

export const getOrderStats = async (): Promise<any> => {
    const response = await apiClient.get("/order/get-order-stats", {
        withCredentials: true,
    });
    return response.data;
};

export const createOrder = async (items: any[], tableNumber: number): Promise<any> => {
    const response = await apiClient.post("/order/add-order", { items, tableNumber }, {
        withCredentials: true,
    });
    return response.data;
};

export const manageOrderPayment = async (id: string, status: string, method?: string): Promise<any> => {
    const response = await apiClient.patch(`/order/manage-order-payment/${id}`, {
        status,
        method,
    }, {
        withCredentials: true,
    });
    return response.data;
};