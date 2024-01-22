import axios from "axios";
import { merge } from "lodash";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  console.log("config: ", config);

  if (!config.url!.includes("auth")) {
    merge(config.headers, {
      Authorization: `Bearer ${localStorage.getItem('refine-auth')}`,
    });
  }

  return config;
});
