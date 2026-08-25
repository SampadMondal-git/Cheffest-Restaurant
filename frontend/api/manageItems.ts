import apiClient from "./apiClient";
export const getAllItems = async (): Promise<any> => {
    const response = await apiClient.get("/items/get-all-items", {
        withCredentials: true,
    });
    return response.data;
};

export const addItem = async (data: any): Promise<any> => {
    const response = await apiClient.post("/items/add-item", data, {
        withCredentials: true,
    });
    return response.data;
};

export const updateItem = async (id: string, data: any): Promise<any> => {
    const response = await apiClient.patch(`/items/update-item/${id}`, data, {
        withCredentials: true,
    });
    return response.data;
};

export const deleteItem = async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/items/delete-item/${id}`, {
        withCredentials: true,
    });
    return response.data;
};