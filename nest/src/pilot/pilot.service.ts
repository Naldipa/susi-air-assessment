import { Inject, Injectable } from '@nestjs/common';
import { DataService } from '../shared/data/data.service';

@Injectable()
export class PilotService {
  constructor(@Inject(DataService) private readonly data: DataService) {}

  getProfile() {
    return {
      name: this.data.flightHours.pilot.name,
      totalFlightHours: this.data.flightHours.pilot.totalFlightHours,
      avatarUrl: null,
    };
  }
}
