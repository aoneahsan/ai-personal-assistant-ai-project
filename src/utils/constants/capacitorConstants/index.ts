import { Capacitor } from '@capacitor/core';
import {
  isMobile,
  isBrowser,
  isChrome,
  isChromium,
  isEdge,
  isFirefox,
  isAndroid as rddIsAndroid,
  isIOS as rddIsIOS,
} from 'react-device-detect';
import { CapacitorPlatformEnum } from 'zaions-tool-kit';

export const isNativePlatform = Capacitor.isNativePlatform();
const capacitorPlatform = Capacitor.getPlatform();
export const isAndroid = capacitorPlatform === CapacitorPlatformEnum.android;
export const isIOS = capacitorPlatform === CapacitorPlatformEnum.ios;
export const isWebBrowser = capacitorPlatform === CapacitorPlatformEnum.web;
export const isHybrid = isNativePlatform;
export const isMobileWeb = isMobile && !isHybrid;
export const isMobileDevice = isAndroid || isIOS;
export const mobileBundledAppOrWebBrowser =
  isHybrid || (!rddIsAndroid && !rddIsIOS);
export const isBrowserWebsite =
  isBrowser ||
  isChrome ||
  isChromium ||
  isEdge ||
  isFirefox ||
  !isHybrid ||
  isWebBrowser;
