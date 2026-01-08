import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('provinces')
  getProvinces() {
    return this.locationsService.getProvinces();
  }

  @Get('districts')
  getDistricts(@Query('provinceCode') provinceCode: string) {
    return this.locationsService.getDistricts(provinceCode);
  }

  @Get('neighbourhoods')
  getNeighbourhoods(
    @Query('provinceCode') provinceCode: string,
    @Query('districtCode') districtCode: string,
  ) {
    return this.locationsService.getNeighbourhoods(provinceCode, districtCode);
  }
}
