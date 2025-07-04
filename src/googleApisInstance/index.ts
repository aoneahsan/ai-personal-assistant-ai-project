import ENV_KEYS from '@/utils/envKeys';
import { Loader } from '@googlemaps/js-api-loader';

const _googleMapsLoader = new Loader({
  apiKey: ENV_KEYS.googleMapsApiKey,
  version: 'weekly',
  id: 'google-maps-script',
  language: 'en',
  region: 'ie',
  libraries: ['places', 'maps', 'core', 'marker', 'geocoding'],
});

let _gmPlacesLibraryInstance: google.maps.PlacesLibrary | null = null;
let _gmMapsLibraryInstance: google.maps.MapsLibrary | null = null;
let _gmCoreLibraryInstance: google.maps.CoreLibrary | null = null;
let _gmMarkerLibraryInstance: google.maps.MarkerLibrary | null = null;
let _gmGeocodingLibraryInstance: google.maps.GeocodingLibrary | null = null;

// Get the Google Maps Places API instance
export const getGmPlacesLibraryInstance = async () => {
  if (!_gmPlacesLibraryInstance) {
    _gmPlacesLibraryInstance = await _googleMapsLoader.importLibrary('places');
  }

  return _gmPlacesLibraryInstance;
};

// Get the Google Maps API instance
export const getGmMapsLibraryInstance = async () => {
  if (!_gmMapsLibraryInstance) {
    _gmMapsLibraryInstance = await _googleMapsLoader.importLibrary('maps');
  }

  return _gmMapsLibraryInstance;
};

// Get google maps core library
export const getGmCoreLibraryInstance = async () => {
  if (!_gmCoreLibraryInstance) {
    _gmCoreLibraryInstance = await _googleMapsLoader.importLibrary('core');
  }

  return _gmCoreLibraryInstance;
};

// Get google maps marker library
export const getGmMarkerLibraryInstance = async () => {
  if (!_gmMarkerLibraryInstance) {
    _gmMarkerLibraryInstance = await _googleMapsLoader.importLibrary('marker');
  }

  return _gmMarkerLibraryInstance;
};

// Get google maps geocoding library
export const getGmGeocodingLibraryInstance = async () => {
  if (!_gmGeocodingLibraryInstance) {
    _gmGeocodingLibraryInstance =
      await _googleMapsLoader.importLibrary('geocoding');
  }

  return _gmGeocodingLibraryInstance;
};

/**
 * Fetches autocomplete suggestions from the Google Places API based on the input query and request configuration.
 *
 * @param input - The input query string for which autocomplete suggestions are to be fetched.
 * @param requestConfig - Optional configuration object for customizing the autocomplete request.
 *
 * @returns A promise that resolves to an array of autocomplete suggestions.
 */
export const fetchAutocompleteSuggestions = async (
  input: string,
  requestConfig?: google.maps.places.AutocompleteRequest
): Promise<google.maps.places.AutocompleteSuggestion[]> => {
  try {
    const api = await getGmPlacesLibraryInstance();

    const { AutocompleteSessionToken, AutocompleteSuggestion } = api;

    const token = new AutocompleteSessionToken();
    const request = {
      input,
      language: 'en-US',
      sessionToken: token,
      ...requestConfig,
    };

    const { suggestions } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
    return suggestions;
  } catch (error) {
    throw new Error('Failed to fetch autocomplete suggestions.');
  }
};

/**
 * Converts an array of autocomplete suggestions into an array of place predictions.
 *
 * @param suggestions - An array of autocomplete suggestion objects retrieved from Google Places API.
 *
 * @returns An array of place predictions with structured details and the corresponding `google.maps.places.Place` objects.
 *
 */
export const convertSuggestionsToPredictions = (
  suggestions: google.maps.places.AutocompleteSuggestion[]
) => {
  return suggestions.map((el) => {
    const placePrediction = el.placePrediction;

    return {
      mainText: placePrediction?.mainText,
      distanceMeters: placePrediction?.distanceMeters,
      placeId: placePrediction?.placeId,
      secondaryText: placePrediction?.secondaryText,
      text: placePrediction?.text?.text,
      types: placePrediction?.types,
      place: placePrediction?.toPlace(),
    };
  });
};

/**
 * Fetches detailed information for a specific place using the Google Places API.
 *
 * @param place - The `google.maps.places.Place` object for which detailed information is to be fetched.
 * @param fields - An array of field names to be included in the response.
 *
 * @returns A promise that resolves to the `google.maps.places.Place` object with the requested fields populated.
 *
 */
export const fetchPlaceDetails = async (
  place: google.maps.places.Place,
  fields: string[]
): Promise<google.maps.places.Place> => {
  try {
    await place.fetchFields({ fields });
    return place;
  } catch (error) {
    throw new Error('Failed to fetch place details.');
  }
};

/**
 * Retrieves autocomplete suggestions and fetches detailed information for each place.
 *
 * @param input - The input query string for which autocomplete suggestions are to be fetched.
 * @param requestConfig - Optional configuration object for customizing the autocomplete request.
 * @param fields - An array of field names to be included when fetching detailed place information.
 *
 * @returns A promise that resolves to an object containing:
 * - `errorMessage`: Error message if any error occurs.
 * - `infoMessage`: Information message about the result, e.g., "No suggestions found."
 * - `items`: An array of `google.maps.places.Place` objects with detailed information.
 */
export const autoComplete = async ({
  input,
  requestConfig,
  fields = [
    'location',
    'formattedAddress',
    'displayName',
    'addressComponents',
    'attributions',
    'adrFormatAddress',
  ],
}: {
  input: string;
  requestConfig?: google.maps.places.AutocompleteRequest;
  fields?: string[];
}): Promise<{
  errorMessage: string;
  infoMessage: string;
  items: Array<google.maps.places.Place>;
}> => {
  const result: {
    errorMessage: string;
    infoMessage: string;
    items: Array<google.maps.places.Place>;
  } = {
    errorMessage: '',
    infoMessage: '',
    items: [],
  };

  try {
    const suggestions = await fetchAutocompleteSuggestions(
      input,
      requestConfig
    );

    if (!suggestions || suggestions.length === 0) {
      result.infoMessage = 'No suggestions found';
      return result;
    }

    const placesPrediction = convertSuggestionsToPredictions(suggestions);
    const detailedPlacesPromises = placesPrediction?.map(async (el) => {
      if (el?.place) {
        return fetchPlaceDetails(el.place, fields);
      }
      return null;
    });

    result.items = (await Promise.all(detailedPlacesPromises)).filter(
      (place): place is google.maps.places.Place => place !== null
    );

    if (result?.items?.length === 0) {
      result.infoMessage = 'No detailed places found';
    }
  } catch (error) {
    result.errorMessage = (error as Error).message || 'An error occurred';
  }

  return result;
};
