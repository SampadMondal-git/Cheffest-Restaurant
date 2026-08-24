import apiClient from "./apiClient";

export const createUser = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  role: string,
  position: string,
) => {
  const response = await apiClient.post(
    "/user/create-user",
    {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      position,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const manageUser = async (
  role: string,
  position: string,
  userId: string,
) => {
  const response = await apiClient.patch(
    `/user/manage-user/${userId}`,
    {
      role,
      position,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getUserDetailsByToken = async (token?: string): Promise<any> => {
  const config: any = { withCredentials: true };
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }

  const response = await apiClient.get("/user-details", config);
  return response.data;
};

export const getAllUsers = async (): Promise<any> => {
  const response = await apiClient.get("/user/get-all-users", {
    withCredentials: true,
  });
  return response.data.users;
};

export const updateUserDetailsByToken = async (
  name: string,
  phone: string,
  email: string,
  role?: string,
  position?: string,
): Promise<any> => {
  const response = await apiClient.patch(
    "/update-user-details",
    { name, email, phone, role, position },
    { withCredentials: true },
  );
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await apiClient.delete(
    `/user/delete-user/${userId}`,
    {
      withCredentials: true,
    },
  );
  return response.data;
};
