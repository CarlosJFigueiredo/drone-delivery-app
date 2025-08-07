import axios from 'axios';

const api = axios.create({
  baseURL: 'https://drone-delivery-app.onrender.com/api',
});

export default api;

