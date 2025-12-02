/**
 * Constantes de configuración de la aplicación
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_V1_PREFIX = '/api/v1';

export const ENDPOINTS = {
  // Analysis
  DASHBOARD_STATS: `${API_V1_PREFIX}/analysis/dashboard-stats`,
  SUSPICIOUS_IPS: `${API_V1_PREFIX}/analysis/suspicious-ips`,
  TIMELINE: `${API_V1_PREFIX}/analysis/timeline`,
  PORTS: `${API_V1_PREFIX}/analysis/ports`,
  PATTERNS: `${API_V1_PREFIX}/analysis/patterns`,
  
  // Alerts
  ALERT_SUMMARY: `${API_V1_PREFIX}/alerts/summary`,
  COORDINATED_ATTACKS: `${API_V1_PREFIX}/alerts/coordinated-attacks`,
  PORT_SWEEPS: `${API_V1_PREFIX}/alerts/port-sweeps`,
  ATTACK_VELOCITY: `${API_V1_PREFIX}/alerts/attack-velocity`,
  
  // Reports
  EXECUTIVE_REPORT: `${API_V1_PREFIX}/reports/executive`,
  RECOMMENDATIONS: `${API_V1_PREFIX}/reports/recommendations`,
  METRICS: `${API_V1_PREFIX}/reports/metrics`,
};

export const RISK_LEVELS = {
  CRITICAL: 'Crítico',
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
};

export const RISK_COLORS = {
  'Crítico': 'red',
  'Alto': 'orange',
  'Medio': 'yellow',
  'Bajo': 'green',
};

export const ATTACK_TYPES = {
  PORT_SCAN: 'Port scan',
  SQL_INJECTION: 'SQL Injection',
  BRUTE_FORCE_SSH: 'Brute force SSH',
  DDOS: 'DDoS',
  MALWARE: 'Malware',
};

export const REFRESH_INTERVAL = 30000; // 30 segundos