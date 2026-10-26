import { Controller, Get, Inject } from '@nestjs/common';
import { PilotService } from './pilot.service';

@Controller('pilot')
export class PilotController {
  constructor(@Inject(PilotService) private readonly pilots: PilotService) {}

  @Get('me')
  getProfile() {
    return this.pilots.getProfile();
  }
}
