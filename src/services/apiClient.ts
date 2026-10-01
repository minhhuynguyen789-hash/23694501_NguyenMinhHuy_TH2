import axios from 'axios';
import { STUDENT } from '@constants/student';

export const apiClient = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor gắn X-Student-Id: {mssv}
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Student-Id'] = STUDENT.mssv;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
