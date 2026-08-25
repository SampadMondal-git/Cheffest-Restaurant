import apiClient from "./apiClient";

export const getReviewsByItemId = async (itemId: string) => {
  const response = await apiClient.get(`/reviews/${itemId}`);
  return response.data;
};

export const postReview = async (itemId: string, rating: number, comment: string) => {
  const response = await apiClient.post(
    `/reviews/${itemId}`,
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
  const response = await apiClient.delete(`/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
    },
  });
  return response.data;
};
