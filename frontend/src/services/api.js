import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const analyzeComplaint = async (complaint) => {
  const response = await api.post("/analyze", {
    complaint,
  });

  return response.data;
};
