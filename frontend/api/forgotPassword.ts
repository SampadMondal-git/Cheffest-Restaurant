import axios from "axios";

const forgotPassword = async (email: string): Promise<void> => {
    const response = await axios.post<void>("http://localhost:5000/forgot-password", {
        email,
    });

    return response.data;
};

export default forgotPassword;