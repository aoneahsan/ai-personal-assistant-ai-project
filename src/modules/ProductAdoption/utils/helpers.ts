export const generateTourId = (): string => {
  return `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateWidgetId = (): string => {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSegmentId = (): string => {
  return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSessionId = (): string => {
  const existing = sessionStorage.getItem('productAdoption_sessionId');
  if (existing) return existing;

  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('productAdoption_sessionId', newId);
  return newId;
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};

export const getElementPosition = (selector: string): DOMRect | null => {
  try {
    const element = document.querySelector(selector);
    return element ? element.getBoundingClientRect() : null;
  } catch {
    return null;
  }
};

export const isElementVisible = (selector: string): boolean => {
  try {
    const element = document.querySelector(selector);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  } catch {
    return false;
  }
};

export const scrollToElement = (
  selector: string,
  offset: number = 100
): void => {
  try {
    const element = document.querySelector(selector);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    console.error('Error scrolling to element:', error);
  }
};

export const createOverlay = (opacity: number = 0.5): HTMLDivElement => {
  const overlay = document.createElement('div');
  overlay.className = 'product-adoption-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, ${opacity});
    z-index: 9998;
    pointer-events: none;
  `;
  return overlay;
};

export const createSpotlight = (
  selector: string,
  padding: number = 10,
  radius: number = 8
): HTMLDivElement | null => {
  const element = document.querySelector(selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const spotlight = document.createElement('div');
  spotlight.className = 'product-adoption-spotlight';
  spotlight.style.cssText = `
    position: fixed;
    top: ${rect.top - padding}px;
    left: ${rect.left - padding}px;
    width: ${rect.width + padding * 2}px;
    height: ${rect.height + padding * 2}px;
    border-radius: ${radius}px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    z-index: 9999;
  `;
  return spotlight;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const getBrowserInfo = (): { name: string; version: string } => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  }

  return { name, version };
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const mergeStyles = (
  ...styles: (React.CSSProperties | undefined)[]
): React.CSSProperties => {
  return Object.assign({}, ...styles.filter(Boolean));
};
