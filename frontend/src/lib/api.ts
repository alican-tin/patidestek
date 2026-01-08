import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error message helper
const getErrorMessage = (error: AxiosError<{ message?: string | string[] }>): string => {
  if (error.response?.data?.message) {
    const message = error.response.data.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message;
  }
  
  switch (error.response?.status) {
    case 400:
      return 'Geçersiz istek. Lütfen girilen bilgileri kontrol edin.';
    case 401:
      return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz bulunmuyor.';
    case 404:
      return 'İstenen kaynak bulunamadı.';
    case 409:
      return 'Bu kayıt zaten mevcut.';
    case 500:
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Attach friendly error message
    const friendlyMessage = getErrorMessage(error);
    error.message = friendlyMessage;
    
    return Promise.reject(error);
  }
);

export default api;
