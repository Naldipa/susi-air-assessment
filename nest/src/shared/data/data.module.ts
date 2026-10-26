import { Global, Module } from '@nestjs/common';
import { DataService } from './data.service';

@Global()
@Module({
  providers: [
    {
      provide: DataService,
      useFactory: () => new DataService(),
    },
  ],
  exports: [DataService],
})
export class DataModule {}