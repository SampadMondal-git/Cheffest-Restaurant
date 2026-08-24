import axios from "axios";

interface SignupResponse {
  message: string;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    position?: string;
  };
}

export const signup = async (
  name: string,
  phone: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(
    "http://localhost:5000/signup",
    {
      name,
      phone,
      email,
      password,
      confirmPassword,
    },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

interface LoginResponse {
  message: string;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    position?: string;
  };
}

export const login = async (
  identifier: string,
  password: string,
  rememberMe: boolean,
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    "http://localhost:5000/login",
    {
      identifier,
      password,
      rememberMe,
    },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

type LogoutResponse = {
  message: string;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await axios.post<LogoutResponse>(
    "http://localhost:5000/logout",
    {},
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  const response = await axios.post<void>(
    "http://localhost:5000/forgot-password",
    {
      email,
    },
  );

  return response.data;
};

export const validateToken = async (token: string): Promise<boolean> => {
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

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string,
): Promise<void> => {
  const response = await axios.post<void>(
    `http://localhost:5000/reset-password/${token}`,
    {
      password,
      confirmPassword,
    },
  );

  return response.data;
};
