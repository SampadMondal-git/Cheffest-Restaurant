import axios from "axios";

export const getReviewsByItemId = async (itemId: string) => {
  const response = await axios.get(`http://localhost:5000/reviews/${itemId}`);
  return response.data;
};

export const postReview = async (itemId: string, rating: number, comment: string) => {
  const response = await axios.post(
    `http://localhost:5000/reviews/${itemId}`,
    { rating, comment },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await axios.delete(`http://localhost:5000/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
    },
  });
  return response.data;
};
