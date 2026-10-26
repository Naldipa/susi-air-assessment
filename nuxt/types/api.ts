export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  avatarUrl: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: { username: string; name: string };
}

export interface LimitCardItem {
  key: string;
  label: string;
  limit: number;
  windowDays: number;
  usedHours: number;
  percentage: number;
}

export interface LimitsResponse {
  referenceDate: string;
  cards: LimitCardItem[];
}

export interface FlightHoursPoint {
  date: string;
  hours: number;
  rollingHours: number;
}

export interface DailyFlightRecord {
  date: string;
  hours: number;
}

export interface FlightHoursRecordsResponse {
  from: string;
  to: string;
  records: DailyFlightRecord[];
  totalHours: number;
}
export interface FlightHoursSummary {
  range: string;
  referenceDate: string;
  windowDays: number;
  limit: number;
  chartMax: number;
  displayRange: { from: string; to: string };
  points: FlightHoursPoint[];
}

export type DocumentStatus = 'safe' | 'soon' | 'expired';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  referenceDate: string;
  sourceReferenceDate: string;
  warningDays: number;
  documents: PilotDocument[];
}

export interface ScheduleRecord {
  id: string;
  duty_date: string;
  status: 1 | 2;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface DutyLegendEntry {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponse {
  year: number;
  month: number;
  referenceDate: string;
  sourceReferenceDate: string;
  legend: DutyLegendEntry[];
  schedules: ScheduleRecord[];
}
