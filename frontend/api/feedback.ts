import axios from "axios";

type FeedbackDate = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const sendFeedback = async (data: FeedbackDate) => {
  const response = await axios.post(
    "http://localhost:5000/contact/add-contact",
    data,
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export default sendFeedback;
