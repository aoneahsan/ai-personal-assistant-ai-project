import { Axios } from 'axios';

const axiosInstance = new Axios({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to throw errors for status codes 400 and above
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response && error?.response?.status >= 400) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
