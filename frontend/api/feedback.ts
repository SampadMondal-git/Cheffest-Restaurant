import apiClient from "./apiClient";

type FeedbackDate = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const sendFeedback = async (data: FeedbackDate) => {
  const response = await apiClient.post(
    "/contact/add-contact",
    data,
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export default sendFeedback;
