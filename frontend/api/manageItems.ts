import axios from "axios";
export const getAllItems = async (): Promise<any> => {
    const response = await axios.get("http://localhost:5000/items/get-all-items", {
        withCredentials: true,
    });
    return response.data;
};

export const addItem = async (data: any): Promise<any> => {
    const response = await axios.post("http://localhost:5000/items/add-item", data, {
        withCredentials: true,
    });
    return response.data;
};

export const updateItem = async (id: string, data: any): Promise<any> => {
    const response = await axios.patch(`http://localhost:5000/items/update-item/${id}`, data, {
        withCredentials: true,
    });
    return response.data;
};

export const deleteItem = async (id: string): Promise<any> => {
    const response = await axios.delete(`http://localhost:5000/items/delete-item/${id}`, {
        withCredentials: true,
    });
    return response.data;
};