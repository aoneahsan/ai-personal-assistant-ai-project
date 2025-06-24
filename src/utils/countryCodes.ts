import { getGmGeocodingLibraryInstance } from '@/googleApisInstance';
import { consoleError } from './helpers/consoleHelper';

export interface IGeolocationCoords {
  lat: number;
  lng: number;
}

export interface IGeolocationPosition {
  coords: IGeolocationCoords;
  position: GeolocationPosition;
}

export interface ILocationInfo {
  address: string;
  name: string;
  code: string;
}

export const getUserCurrentLocation =
  async (): Promise<IGeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = {
            lat: latitude && parseFloat(String(latitude)),
            lng: longitude && parseFloat(String(longitude)),
          };

          // returning an object so if in future we decide to return any other info as well, it will not affect any current implementation
          resolve({ coords, position });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

export const getUserCurrentLocationInfo =
  async (): Promise<ILocationInfo | null> => {
    try {
      const gmGeocodingLibraryInstance = await getGmGeocodingLibraryInstance();
      const geocoder = new gmGeocodingLibraryInstance.Geocoder();

      const data = await getUserCurrentLocation();
      const { coords } = data;

      return new Promise<ILocationInfo>((resolve, reject) => {
        geocoder
          .geocode({ location: coords })
          .then((response) => {
            if (response && response.results?.length > 0) {
              const formattedAddress = response.results[0].formatted_address;
              const addressComponent =
                response.results[response.results.length - 1]
                  ?.address_components[0];

              if (addressComponent) {
                const fullName = addressComponent.long_name;
                const shortName = addressComponent.short_name;

                resolve({
                  address: formattedAddress,
                  name: fullName,
                  code: shortName,
                });
              } else {
                reject(new Error('Address components not found'));
              }
            } else {
              reject(new Error('No results found'));
            }
          })
          .catch((error) => {
            reject(new Error(`Geocode failed: ${error.message}`));
          });
      });
    } catch (error) {
      consoleError({ message: 'Error in getUserCurrentLocationInfo:', error });
      return null; // Return null in case of an error
    }
  };

export const getCountryInfo = async (): Promise<ILocationInfo | null> => {
  try {
    const data = await getUserCurrentLocationInfo();
    return data ?? null;
  } catch (error) {
    return null;
  }
};
