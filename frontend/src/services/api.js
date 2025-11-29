/**
 * Cliente API para comunicación con el backend FastAPI
 */
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from './constants';

// Configurar instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging (desarrollo)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    return Promise.reject(error);
  }
);

// ==================== ANALYSIS ENDPOINTS ====================

export const fetchDashboardStats = async (ipThreshold = null) => {
  try {
    const params = ipThreshold ? { ip_threshold: ipThreshold } : {};
    const response = await apiClient.get(ENDPOINTS.DASHBOARD_STATS, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchSuspiciousIPs = async (limit = 10, minAttacks = 5) => {
  try {
    const response = await apiClient.get(ENDPOINTS.SUSPICIOUS_IPS, {
      params: { limit, min_attacks: minAttacks }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suspicious IPs:', error);
    throw error;
  }
};

export const fetchTimeline = async (interval = 'H') => {
  try {
    const response = await apiClient.get(ENDPOINTS.TIMELINE, {
      params: { interval }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    throw error;
  }
};

export const fetchPortAnalysis = async (topN = 15) => {
  try {
    const response = await apiClient.get(ENDPOINTS.PORTS, {
      params: { top_n: topN }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching port analysis:', error);
    throw error;
  }
};

export const fetchAttackPatterns = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.PATTERNS);
    return response.data;
  } catch (error) {
    console.error('Error fetching attack patterns:', error);
    throw error;
  }
};

// ==================== ALERTS ENDPOINTS ====================

export const fetchAlertSummary = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.ALERT_SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Error fetching alert summary:', error);
    throw error;
  }
};

export const fetchCoordinatedAttacks = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.COORDINATED_ATTACKS);
    return response.data;
  } catch (error) {
    console.error('Error fetching coordinated attacks:', error);
    throw error;
  }
};

export const fetchPortSweeps = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.PORT_SWEEPS);
    return response.data;
  } catch (error) {
    console.error('Error fetching port sweeps:', error);
    throw error;
  }
};

export const fetchAttackVelocity = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.ATTACK_VELOCITY);
    return response.data;
  } catch (error) {
    console.error('Error fetching attack velocity:', error);
    throw error;
  }
};

// ==================== REPORTS ENDPOINTS ====================

export const fetchExecutiveReport = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.EXECUTIVE_REPORT);
    return response.data;
  } catch (error) {
    console.error('Error fetching executive report:', error);
    throw error;
  }
};

export const fetchRecommendations = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.RECOMMENDATIONS);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const fetchKeyMetrics = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.METRICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    throw error;
  }
};

// ==================== HEALTH CHECK ====================

export const checkAPIHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    return { status: 'offline' };
  }
};

export default apiClient;