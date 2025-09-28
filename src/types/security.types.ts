export interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  description: string;
  source: string;
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  status: ThreatStatus;
  riskScore: number;
  metadata: Record<string, unknown>;
}

export interface FraudAlert {
  id: string;
  type: FraudType;
  severity: AlertSeverity;
  userId: string;
  amount?: string;
  description: string;
  timestamp: Date;
  riskScore: number;
  confidence: number;
  triggers: string[];
  status: AlertStatus;
  investigationNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  location?: {
    city?: string;
    country?: string;
  };
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  type?: string;
  os?: string;
  browser?: string;
}

export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  details: Record<string, unknown>;
  riskScore: number;
  flagged: boolean;
}

export interface IncidentResponse {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  timeline: IncidentTimelineEvent[];
  affectedUsers: string[];
  actions: IncidentAction[];
  tags: string[];
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
}

export interface IncidentAction {
  id: string;
  type: ActionType;
  description: string;
  status: ActionStatus;
  scheduledAt?: Date;
  completedAt?: Date;
  performedBy?: string;
  result?: string;
}

export interface SecurityMetrics {
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  fraudAlerts: number;
  riskScore: number;
  threatTrends: ThreatTrend[];
  topThreats: ThreatSummary[];
  complianceScore: number;
}

export interface ThreatTrend {
  date: string;
  count: number;
  severity: ThreatSeverity;
  type: ThreatType;
}

export interface ThreatSummary {
  type: ThreatType;
  count: number;
  riskScore: number;
  lastOccurrence: Date;
}

export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  behaviorAnalysis: BehaviorAnalysis;
  lastAssessed: Date;
  flags: SecurityFlag[];
  totalTransactions?: number;
  flaggedTransactions?: number;
  accountAge?: number;
  deviceFingerprints?: number;
  fraudHistory?: number;
  lastActivity?: Date;
}

export interface RiskFactor {
  type: string;
  weight: number;
  value: unknown;
  description: string;
}

export interface BehaviorAnalysis {
  loginPatterns: LoginPattern[];
  deviceFingerprints: DeviceFingerprint[];
  locationHistory: LocationHistory[];
  transactionPatterns: TransactionPattern[];
  anomalies: BehaviorAnomaly[];
}

export interface LoginPattern {
  timeOfDay: number[];
  daysOfWeek: number[];
  frequency: number;
  locations: string[];
  devices: string[];
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  plugins: string[];
  firstSeen: Date;
  lastSeen: Date;
  trusted: boolean;
}

export interface LocationHistory {
  location: GeoLocation;
  timestamp: Date;
  trusted: boolean;
  frequency: number;
}

export interface TransactionPattern {
  averageAmount: number;
  frequency: number;
  timePatterns: number[];
  merchantTypes: string[];
  anomalyScore: number;
}

export interface BehaviorAnomaly {
  type: string;
  severity: number;
  description: string;
  timestamp: Date;
  confidence: number;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isVpn?: boolean;
  isTor?: boolean;
}

export interface SecurityFlag {
  type: string;
  reason: string;
  severity: FlagSeverity;
  timestamp: Date;
  autoResolved?: boolean;
  resolvedBy?: string;
}

export interface ComplianceCheck {
  id: string;
  standard: ComplianceStandard;
  status: ComplianceStatus;
  score: number;
  lastChecked: Date;
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  rule: string;
  status: "passed" | "failed" | "warning";
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  recommendation?: string;
}

export enum ThreatType {
  BRUTE_FORCE = "brute_force",
  SUSPICIOUS_LOGIN = "suspicious_login",
  ACCOUNT_TAKEOVER = "account_takeover",
  DATA_BREACH_ATTEMPT = "data_breach_attempt",
  MALICIOUS_IP = "malicious_ip",
  UNUSUAL_ACTIVITY = "unusual_activity",
  PHISHING_ATTEMPT = "phishing_attempt",
  MALWARE_DETECTED = "malware_detected",
  DDOS_ATTACK = "ddos_attack",
  SQL_INJECTION = "sql_injection",
  XSS_ATTEMPT = "xss_attempt",
  CSRF_ATTEMPT = "csrf_attempt",
}

export enum FraudType {
  PAYMENT_FRAUD = "payment_fraud",
  IDENTITY_THEFT = "identity_theft",
  ACCOUNT_FRAUD = "account_fraud",
  TRANSACTION_FRAUD = "transaction_fraud",
  SYNTHETIC_IDENTITY = "synthetic_identity",
  CHARGEBACK_FRAUD = "chargeback_fraud",
  AFFILIATE_FRAUD = "affiliate_fraud",
  BONUS_ABUSE = "bonus_abuse",
  FAKE_REVIEWS = "fake_reviews",
}

export enum ThreatSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AlertSeverity {
  INFO = "info",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ThreatStatus {
  ACTIVE = "active",
  INVESTIGATING = "investigating",
  MITIGATED = "mitigated",
  RESOLVED = "resolved",
  FALSE_POSITIVE = "false_positive",
}

export enum AlertStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  FALSE_POSITIVE = "false_positive",
  ESCALATED = "escalated",
}

export enum SecurityEventType {
  LOGIN_ATTEMPT = "login_attempt",
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  PASSWORD_CHANGE = "password_change",
  EMAIL_CHANGE = "email_change",
  PROFILE_UPDATE = "profile_update",
  TRANSACTION = "transaction",
  DATA_ACCESS = "data_access",
  API_CALL = "api_call",
  ADMIN_ACTION = "admin_action",
}

export enum IncidentSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum IncidentStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum ActionType {
  BLOCK_IP = "block_ip",
  SUSPEND_ACCOUNT = "suspend_account",
  REQUIRE_2FA = "require_2fa",
  SEND_ALERT = "send_alert",
  ESCALATE = "escalate",
  INVESTIGATE = "investigate",
  MONITOR = "monitor",
}

export enum ActionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum RiskLevel {
  VERY_LOW = "very_low",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
  CRITICAL = "critical",
}

export enum FlagSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

export enum ComplianceStandard {
  PCI_DSS = "pci_dss",
  GDPR = "gdpr",
  SOX = "sox",
  HIPAA = "hipaa",
  ISO_27001 = "iso_27001",
}

export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PARTIALLY_COMPLIANT = "partially_compliant",
  UNDER_REVIEW = "under_review",
}

// API Response types
export interface SecurityDashboardData {
  metrics: SecurityMetrics;
  activeThreats: SecurityThreat[];
  recentAlerts: FraudAlert[];
  incidents: IncidentResponse[];
  compliance: ComplianceCheck[];
}

export interface ThreatDetectionResponse {
  threats: SecurityThreat[];
  total: number;
  page: number;
  limit: number;
  filters: Record<string, unknown>;
}

export interface FraudDetectionResponse {
  alerts: FraudAlert[];
  total: number;
  page: number;
  limit: number;
  riskProfiles: UserRiskProfile[];
}
