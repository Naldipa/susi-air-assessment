import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type {
  AssessmentData,
  DocumentsData,
  FlightHoursData,
  SchedulesData,
} from './data.models';

@Injectable()
export class DataService {
  private readonly data: AssessmentData;

  constructor(dataDirOverride?: string) {
    const dataDir = this.resolveDataDirectory(dataDirOverride);
    this.data = {
      flightHours: this.readJson<FlightHoursData>(join(dataDir, 'mock-flight-hours.json')),
      documents: this.readJson<DocumentsData>(join(dataDir, 'mock-documents.json')),
      schedules: this.readJson<SchedulesData>(join(dataDir, 'mock-schedules.json')),
    };
  }

  get flightHours(): FlightHoursData {
    return this.data.flightHours;
  }

  get documents(): DocumentsData {
    return this.data.documents;
  }

  get schedules(): SchedulesData {
    return this.data.schedules;
  }

  private resolveDataDirectory(override?: string): string {
    const candidates = [
      override ? resolve(process.cwd(), override) : undefined,
      process.env.DATA_DIR ? resolve(process.cwd(), process.env.DATA_DIR) : undefined,
      resolve(process.cwd(), 'data'),
      resolve(process.cwd(), '../data'),
      resolve(__dirname, '../../../../data'),
      resolve(__dirname, '../../../data'),
    ].filter((candidate): candidate is string => Boolean(candidate));

    const match = candidates.find((candidate) =>
      ['mock-flight-hours.json', 'mock-documents.json', 'mock-schedules.json'].every(
        (file) => existsSync(join(candidate, file)),
      ),
    );

    if (!match) {
      throw new Error(
        'Assessment JSON files were not found. Set DATA_DIR to the folder containing all three files.',
      );
    }
    return match;
  }

  private readJson<T>(path: string): T {
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown read error';
      throw new Error('Unable to load assessment data at ' + path + ': ' + message);
    }
  }
}

export function assessmentDate(): string {
  return process.env.ASSESSMENT_TODAY ?? '2026-05-15';
}
