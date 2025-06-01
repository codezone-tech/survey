import axios from 'axios';
import { toast } from 'react-toastify';

// Enable/Disable CORS dynamically (set this to true or false)
const ENABLE_CORS = false; // Change to `true` to enable CORS

// Create Axios instance
const api = axios.create({
  baseURL: 'https://survey-admin.edusoftx.com/public/api/v1', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: ENABLE_CORS, // Controls whether cookies are sent with requests
});

// Request Interceptor: Attach Authorization Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors & CORS Issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("❌ Bad Request:", data.message);
          toast.error(`${data.message}`); // Display error using toast
          return Promise.reject(data);
        case 401:
          console.error("🔑 Unauthorized. Redirecting to login...");
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error("🚫 Forbidden:", data.message);
          break;
        case 404:
          console.error("🔍 Not Found:", data.message);
          break;
        case 409:
          console.error("⚠️ Conflict:", data.message);
          break;
        case 422:
          console.error("📝 Validation Error:", data.message);
          toast.error(`Validation Error: ${data.message}`);
          return Promise.reject(data);
        case 500:
          console.error("🔥 Server Error:", data.message);
          break;
        default:
          console.error("Unknown Error:", data.message);
      }
    } else if (error.request) {
      console.error("⚠️ No response from server. Possible CORS error (CORS is disabled).");
    } else {
      console.error("❌ Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

// File Upload Method (Supports Single & Multiple Files)
const upload = (url, files, extraData = {}, config = {}) => {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
  } else {
    formData.append('file', files);
  }

  // Add extra form data if provided
  Object.keys(extraData).forEach((key) => {
    formData.append(key, extraData[key]);
  });

  return api.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: ENABLE_CORS, // Dynamically set CORS
  });
};

// Export API methods
export default {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config),
  upload, 
};
