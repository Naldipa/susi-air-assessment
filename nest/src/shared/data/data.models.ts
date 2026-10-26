export interface PilotData {
  name: string;
  totalFlightHours: number;
}

export interface FlightHourRecord {
  date: string;
  hours: number;
}

export interface ChartBound {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export type ChartRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface FlightHoursData {
  pilot: PilotData;
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
    annual: number;
  };
  chartBounds: Record<ChartRange, ChartBound>;
  flightHours: FlightHourRecord[];
}

export interface DocumentRecord {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsData {
  today: string;
  thresholds: {
    warningDays: number;
    comment: string;
  };
  documents: DocumentRecord[];
}

export interface DutyLegendEntry {
  code: string;
  label: string;
  color: string;
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

export interface SchedulesData {
  today: string;
  fieldGuide: Record<string, string>;
  legend: DutyLegendEntry[];
  schedules: ScheduleRecord[];
}

export interface AssessmentData {
  flightHours: FlightHoursData;
  documents: DocumentsData;
  schedules: SchedulesData;
}
