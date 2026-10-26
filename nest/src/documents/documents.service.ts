import { Inject, Injectable } from '@nestjs/common';
import { DataService, assessmentDate } from '../shared/data/data.service';
import { daysBetween } from '../shared/date/date-utils';

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export function documentStatus(daysRemaining: number, warningDays: number): DocumentStatus {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= warningDays) return 'soon';
  return 'safe';
}

@Injectable()
export class DocumentsService {
  constructor(@Inject(DataService) private readonly data: DataService) {}

  getDocuments() {
    const referenceDate = assessmentDate();
    const warningDays = this.data.documents.thresholds.warningDays;

    return {
      referenceDate,
      sourceReferenceDate: this.data.documents.today,
      warningDays,
      documents: this.data.documents.documents.map((document) => {
        const daysRemaining = daysBetween(referenceDate, document.expiryDate);
        return {
          ...document,
          daysRemaining,
          status: documentStatus(daysRemaining, warningDays),
        };
      }),
    };
  }
}
