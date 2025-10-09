// src/api/likeJob.ts

import axiosInstance from "@/utils/axiosInstance";

export async function likeJob(jobId: number) {
  // 1️⃣ Initialise CSRF (important avec Sanctum)
  //await axiosInstance.get("/sanctum/csrf-cookie");

  // 2️⃣ Ensuite tu fais le like
  const response = await axiosInstance.post(`/api/job-offers/${jobId}/like`);
  return response.data;
}
