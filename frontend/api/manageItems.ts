import apiClient from "./apiClient";

let cachedItemsRequest: Promise<any> | null = null;

export const getAllItems = async (): Promise<any> => {
    if (!cachedItemsRequest) {
        cachedItemsRequest = apiClient
            .get("/items/get-all-items", { withCredentials: true })
            .then((response) => response.data)
            .catch((error) => {
                cachedItemsRequest = null;
                throw error;
            });
    }
    return cachedItemsRequest;
};

export const clearItemsCache = (): void => {
    cachedItemsRequest = null;
};

export const addItem = async (data: any): Promise<any> => {
    const response = await apiClient.post("/items/add-item", data, {
        withCredentials: true,
    });
    clearItemsCache();
    return response.data;
};

export const updateItem = async (id: string, data: any): Promise<any> => {
    const response = await apiClient.patch(`/items/update-item/${id}`, data, {
        withCredentials: true,
    });
    clearItemsCache();
    return response.data;
};

export const deleteItem = async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/items/delete-item/${id}`, {
        withCredentials: true,
    });
    clearItemsCache();
    return response.data;
};