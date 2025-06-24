import { isHybrid } from '@/utils/constants/capacitorConstants';
import { SHARED_ROUTES, URL_TARGET } from '@perkforce/tool-kit';
import { addUrlProtocolHandler } from 'zaions-tool-kit';

const isLocalhost = window.location.hostname.includes('localhost');

export const W_LOCATION = {
  GET_HREF: () => window.location?.href,
  SET_HREF: (val?: string) => {
    if (val) {
      window.location.href = addUrlProtocolHandler(val, isLocalhost);
    }
  },
  GET_PATHNAME: () => window.location?.pathname,
  RELOAD: () => {
    window.location.href = W_LOCATION.GET_HREF();
  },
  GET_SEARCH: () => window.location?.search,
  GET_ORIGIN: () => window.location?.origin,
  GET_HOST: () => window.location?.host,
  REPLACE: (val?: string) =>
    val && window.location?.replace(addUrlProtocolHandler(val, isLocalhost)),
  OPEN: (val?: string) =>
    val &&
    window.open(addUrlProtocolHandler(val, isLocalhost), URL_TARGET.blank),
  REDIRECT_TO_ROOT: () => {
    window.location.href = isHybrid
      ? SHARED_ROUTES.APP_ROOT_URL
      : addUrlProtocolHandler(window.location?.host, isLocalhost);
  },
};
