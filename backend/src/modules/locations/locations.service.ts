import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Neighbourhood {
  name: string;
  districtCode: string;
  provinceCode: string;
}

@Injectable()
export class LocationsService {
  private provinces: Province[] = [];
  private districts: District[] = [];
  private neighbourhoods: Neighbourhood[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const dataPath = path.join(__dirname, '..', '..', '..', 'data', 'locations');
      
      const provincesPath = path.join(dataPath, 'provinces.json');
      if (fs.existsSync(provincesPath)) {
        this.provinces = JSON.parse(fs.readFileSync(provincesPath, 'utf8'));
      }

      const districtsPath = path.join(dataPath, 'districts.json');
      if (fs.existsSync(districtsPath)) {
        this.districts = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
      }

      const neighbourhoodsPath = path.join(dataPath, 'neighbourhoods.json');
      if (fs.existsSync(neighbourhoodsPath)) {
        this.neighbourhoods = JSON.parse(fs.readFileSync(neighbourhoodsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load location data:', error);
    }
  }

  getProvinces(): Province[] {
    return this.provinces.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  getDistricts(provinceCode: string): District[] {
    if (!provinceCode) return [];
    return this.districts
      .filter((d) => d.provinceCode === provinceCode)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  getNeighbourhoods(provinceCode: string, districtCode: string): Neighbourhood[] {
    if (!provinceCode || !districtCode) return [];
    return this.neighbourhoods
      .filter((n) => n.provinceCode === provinceCode && n.districtCode === districtCode)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }
}
