import { GeoLocationResponseCodeEnum } from 'zaions-tool-kit';

export type GetCapGeoLocationApiDataResponse = {
  coords: Partial<GeolocationCoordinates> | null;
  message: string;
  code: GeoLocationResponseCodeEnum;
  success: boolean;
};
