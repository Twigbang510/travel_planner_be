export class CreatePlanPlaceDetailDto {
  planId: number;
  placeId: number;
  indexOfDate: number;
  averageTime: number;
  fromTime: string;
  nextTime: string;
  position: number;
  currentDate: Date;
}
export class CreatePlanDto {
  userId: number;
  startDate: Date;
  endDate: Date;
  places: CreatePlanPlaceDetailDto[];
}
