import { IsEnum } from 'class-validator';

export enum ChartRangeValue {
  Week = '1w',
  Month = '1m',
  ThreeMonths = '3m',
  SixMonths = '6m',
  Year = '1y',
}

export class SummaryQueryDto {
  @IsEnum(ChartRangeValue)
  range!: ChartRangeValue;
}
