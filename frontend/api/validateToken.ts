import axios from "axios";

const validateToken = async (token: string): Promise<boolean> => {
    try {
        await axios.get(`http://localhost:5000/validate-token/${token}`);
        return true; // 200 means valid
    } catch (error: any) {
        if (error.response?.status === 400) {
            return false; // invalid/expired
        }
        throw error; // real error (server/network)
    }
};

export default validateToken;