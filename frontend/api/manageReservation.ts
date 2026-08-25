import apiClient from "./apiClient";

export const BookTable = async (
  name: string,
  email: string,
  person: number,
  time: string,
  date: string,
) => {

  const response = await apiClient.post(
    "/reservation/add-reservation",
    {
      name,
      email,
      person,
      time,
      date,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const BookTableForm = async (
  name: string,
  email: string,
  phone: string,
  person: number,
  time: string,
  date: string,
) => {
  const requestBody: Record<string, unknown> = {
    name,
    email,
    person,
    time,
    date,
  };

  if (phone) {
    requestBody.phone = phone;
  }

  const response = await apiClient.post(
    "/reservation/add-reservation",
    requestBody,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export const fetchReservation = async (id: string): Promise<any> => {
  const response = await apiClient.get(
    `/reservation/fetch-reservation-by-id/${id}`,
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const getReservationByUserToken = async (): Promise<any> => {
  const response = await apiClient.get(
    "/reservation/get-reservation-by-user",
    {
      withCredentials: true,
    },
  );
  return response.data;
};

export const updateReservation = async (id: string, data: any): Promise<any> => {
    const response = await apiClient.patch(`/reservation/update-reservation/${id}`, data, {
        withCredentials: true,
    });
    return response.data;
};

export const getAllReservations = async (): Promise<any> => {
    const response = await apiClient.get("/reservation/get-all-reservations", {
        withCredentials: true,
    });
    return response.data;
};

export const getReservationStats = async (): Promise<any> => {
    const response = await apiClient.get("/reservation/get-reservation-stats", {
        withCredentials: true,
    });
    return response.data;
};