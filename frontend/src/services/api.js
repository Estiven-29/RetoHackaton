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

export const fetchDashboardStats = async (ipThreshold = 10, datasetId = null) => {
  try {
    console.log('📡 API Request: GET /api/v1/analysis/dashboard-stats', { datasetId });
    const params = { ip_threshold: ipThreshold };
    if (datasetId) params.dataset_id = datasetId;  // ← NUEVO
    
    const response = await apiClient.get('/api/v1/analysis/dashboard-stats', { params });
    console.log('✅ API Response: /api/v1/analysis/dashboard-stats', response.status);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchSuspiciousIPs = async (limit = 10, minAttacks = 5, datasetId = null) => {
  try {
    const params = { limit, min_attacks: minAttacks };
    if (datasetId) params.dataset_id = datasetId;  // ← NUEVO
    
    const response = await apiClient.get('/api/v1/analysis/suspicious-ips', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching suspicious IPs:', error);
    throw error;
  }
};

export const fetchTimeline = async (interval = 'H', datasetId = null) => {
  try {
    const params = { interval };
    if (datasetId) params.dataset_id = datasetId;  // ← NUEVO
    
    const response = await apiClient.get('/api/v1/analysis/timeline', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    throw error;
  }
};

export const fetchPortAnalysis = async (topN = 15, datasetId = null) => {
  try {
    const params = { top_n: topN };
    if (datasetId) params.dataset_id = datasetId;  // ← NUEVO
    
    const response = await apiClient.get('/api/v1/analysis/ports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching port analysis:', error);
    throw error;
  }
};

export const fetchAttackPatterns = async (datasetId = null) => {
  try {
    const params = {};
    if (datasetId) params.dataset_id = datasetId;  // ← NUEVO
    
    const response = await apiClient.get('/api/v1/analysis/patterns', { params });
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

// ==================== ML ANALYSIS ENDPOINTS ====================

export const fetchMLAnomalies = async (contamination = 0.1) => {
  try {
    const response = await apiClient.get('/api/v1/ml/anomalies', {
      params: { contamination }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ML anomalies:', error);
    throw error;
  }
};

export const fetchAttackPredictions = async () => {
  try {
    const response = await apiClient.get('/api/v1/ml/predict-attacks');
    return response.data;
  } catch (error) {
    console.error('Error fetching attack predictions:', error);
    throw error;
  }
};

export const fetchIPBehaviorAnalysis = async (ip) => {
  try {
    const response = await apiClient.get(`/api/v1/ml/behavioral-analysis/${ip}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching IP behavior:', error);
    throw error;
  }
};

// ==================== AUTO RESPONSE ENDPOINTS ====================

export const fetchFirewallRules = async (minRiskLevel = 'Alto') => {
  try {
    const response = await apiClient.get('/api/v1/response/firewall-rules', {
      params: { min_risk_level: minRiskLevel }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching firewall rules:', error);
    throw error;
  }
};

export const fetchFail2BanConfig = async () => {
  try {
    const response = await apiClient.get('/api/v1/response/fail2ban-config');
    return response.data;
  } catch (error) {
    console.error('Error fetching fail2ban config:', error);
    throw error;
  }
};

export const fetchRemediationPlaybook = async (ip) => {
  try {
    const response = await apiClient.get(`/api/v1/response/remediation-playbook/${ip}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching remediation playbook:', error);
    throw error;
  }
};

export const simulateAttack = async (attackType, target) => {
  try {
    const response = await apiClient.post('/api/v1/response/simulate-attack', {
      attack_type: attackType,
      target: target
    });
    return response.data;
  } catch (error) {
    console.error('Error simulating attack:', error);
    throw error;
  }
};

export const fetchQuickActions = async () => {
  try {
    const response = await apiClient.get('/api/v1/response/quick-actions');
    return response.data;
  } catch (error) {
    console.error('Error fetching quick actions:', error);
    throw error;
  }
};

// ==================== NETWORK GRAPH ENDPOINTS ====================

// ==================== NETWORK GRAPH ENDPOINTS ====================

export const fetchAttackNetworkGraph = async () => {
  try {
    console.log('📡 API Request: GET /api/v1/graph/attack-network');
    const response = await apiClient.get('/api/v1/graph/attack-network');
    console.log(' API Response: /api/v1/graph/attack-network', response.status);
    return response.data;
  } catch (error) {
    console.error(' Error fetching attack network graph:', error);
    throw error;
  }
};

export const fetchAttackPaths = async () => {
  try {
    const response = await apiClient.get('/api/v1/graph/attack-paths');
    return response.data;
  } catch (error) {
    console.error('Error fetching attack paths:', error);
    throw error;
  }
};

export const fetchAttackHotspots = async () => {
  try {
    const response = await apiClient.get('/api/v1/graph/hotspots');
    return response.data;
  } catch (error) {
    console.error('Error fetching attack hotspots:', error);
    throw error;
  }
};

// ==================== DATASET MANAGEMENT ENDPOINTS ====================

export const uploadDataset = async (file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    const response = await apiClient.post('/api/v1/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw error;
  }
};

export const listDatasets = async () => {
  try {
    const response = await apiClient.get('/api/v1/datasets/list');
    return response.data;
  } catch (error) {
    console.error('Error listing datasets:', error);
    throw error;
  }
};

export const deleteDataset = async (datasetId) => {
  try {
    const response = await apiClient.delete(`/api/v1/datasets/${datasetId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting dataset:', error);
    throw error;
  }
};

export const analyzeDataset = async (datasetId) => {
  try {
    const response = await apiClient.post(`/api/v1/datasets/${datasetId}/analyze`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing dataset:', error);
    throw error;
  }
};

export const compareDatasets = async (datasetId1, datasetId2) => {
  try {
    const response = await apiClient.post('/api/v1/datasets/compare', null, {
      params: { dataset_id1: datasetId1, dataset_id2: datasetId2 }
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing datasets:', error);
    throw error;
  }
};

export const fetchProfessionalRecommendations = async () => {
  try {
    const response = await apiClient.get('/api/v1/reports/professional-recommendations');
    return response.data;
  } catch (error) {
    console.error('Error fetching professional recommendations:', error);
    throw error;
  }
};



export default apiClient;