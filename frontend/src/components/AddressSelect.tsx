import React, { useState, useEffect } from 'react';
import { Select, Label } from 'flowbite-react';
import api from '../lib/api';
import { Province, District, Neighbourhood } from '../types';

interface AddressSelectProps {
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  neighbourhoodName: string;
  onChange: (address: {
    provinceCode: string;
    provinceName: string;
    districtCode: string;
    districtName: string;
    neighbourhoodName: string;
  }) => void;
}

const AddressSelect: React.FC<AddressSelectProps> = ({
  provinceCode,
  provinceName,
  districtCode,
  districtName,
  neighbourhoodName,
  onChange,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await api.get<Province[]>('/locations/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      setLoading(true);
      try {
        const response = await api.get<District[]>(`/locations/districts?provinceCode=${provinceCode}`);
        setDistricts(response.data);
      } catch (error) {
        console.error('Failed to load districts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDistricts();
  }, [provinceCode]);

  useEffect(() => {
    if (!provinceCode || !districtCode) {
      setNeighbourhoods([]);
      return;
    }

    const loadNeighbourhoods = async () => {
      setLoading(true);
      try {
        const response = await api.get<Neighbourhood[]>(
          `/locations/neighbourhoods?provinceCode=${provinceCode}&districtCode=${districtCode}`
        );
        setNeighbourhoods(response.data);
      } catch (error) {
        console.error('Failed to load neighbourhoods:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNeighbourhoods();
  }, [provinceCode, districtCode]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const province = provinces.find((p) => p.code === code);
    onChange({
      provinceCode: code,
      provinceName: province?.name || '',
      districtCode: '',
      districtName: '',
      neighbourhoodName: '',
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const district = districts.find((d) => d.code === code);
    onChange({
      provinceCode,
      provinceName,
      districtCode: code,
      districtName: district?.name || '',
      neighbourhoodName: '',
    });
  };

  const handleNeighbourhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    onChange({
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      neighbourhoodName: name,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="province" value="İl *" />
        <Select
          id="province"
          value={provinceCode}
          onChange={handleProvinceChange}
          required
        >
          <option value="">İl Seçin</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="district" value="İlçe *" />
        <Select
          id="district"
          value={districtCode}
          onChange={handleDistrictChange}
          disabled={!provinceCode || loading}
          required
        >
          <option value="">İlçe Seçin</option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="neighbourhood" value="Mahalle *" />
        <Select
          id="neighbourhood"
          value={neighbourhoodName}
          onChange={handleNeighbourhoodChange}
          disabled={!districtCode || loading}
          required
        >
          <option value="">Mahalle Seçin</option>
          {neighbourhoods.map((n, index) => (
            <option key={index} value={n.name}>
              {n.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default AddressSelect;
