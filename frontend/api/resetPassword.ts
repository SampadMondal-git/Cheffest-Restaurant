import axios from "axios";

const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<void> => {
     const response = await axios.post<void>(`http://localhost:5000/reset-password/${token}`, {
          password,
          confirmPassword,
     });

     return response.data;
};

export default resetPassword;