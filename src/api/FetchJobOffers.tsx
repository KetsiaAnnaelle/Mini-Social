import axiosInstance from "@/utils/axiosInstance";

export const FetchJobOffers = async () => {
  await axiosInstance.get('/sanctum/csrf-cookie');  // Facultatif ici, mais safe
  const response = await axiosInstance.get('/api/job-offers');
  return response.data;
};
