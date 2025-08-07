import axios from 'axios';

// Configuração da URL base da API baseada em variáveis de ambiente
const getBaseURL = () => {
  // Prioridade: variável de ambiente > detecção automática
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback para detecção automática
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api';
  }
  
  // Produção - URL fixa do backend no Render
  return 'https://drone-delivery-app.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15 segundos de timeout para Render
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(request => {
    console.log('🚀 API Request:', request.method?.toUpperCase(), request.url);
    console.log('📍 Base URL:', request.baseURL);
    return request;
  });

  api.interceptors.response.use(
    response => {
      console.log('✅ API Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}

// Interceptor para retry em caso de erro 502/503 (cold start do Render)
api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    
    // Retry para erros de cold start do Render
    if (response?.status === 502 || response?.status === 503) {
      if (!config._retry) {
        config._retry = true;
        console.log('🔄 Retrying request due to server cold start...');
        
        // Aguarda 2 segundos antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return api(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

