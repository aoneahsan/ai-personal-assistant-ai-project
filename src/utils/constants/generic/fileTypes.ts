// File type constants for consistent media handling
export const FILE_TYPES = {
  // Image types
  IMAGE: {
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    PNG: 'image/png',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml',
    BMP: 'image/bmp',
    TIFF: 'image/tiff',
    ICO: 'image/x-icon',
  },

  // Video types
  VIDEO: {
    MP4: 'video/mp4',
    WEBM: 'video/webm',
    OGG: 'video/ogg',
    AVI: 'video/x-msvideo',
    MOV: 'video/quicktime',
    WMV: 'video/x-ms-wmv',
    FLV: 'video/x-flv',
    MKV: 'video/x-matroska',
  },

  // Audio types
  AUDIO: {
    MP3: 'audio/mp3',
    WAV: 'audio/wav',
    OGG: 'audio/ogg',
    AAC: 'audio/aac',
    FLAC: 'audio/flac',
    WEBM: 'audio/webm',
    M4A: 'audio/m4a',
    WMA: 'audio/x-ms-wma',
  },

  // Document types
  DOCUMENT: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    RTF: 'application/rtf',
    ODT: 'application/vnd.oasis.opendocument.text',
    ODS: 'application/vnd.oasis.opendocument.spreadsheet',
    ODP: 'application/vnd.oasis.opendocument.presentation',
  },

  // Text types
  TEXT: {
    PLAIN: 'text/plain',
    HTML: 'text/html',
    CSS: 'text/css',
    JAVASCRIPT: 'text/javascript',
    JSON: 'application/json',
    XML: 'application/xml',
    CSV: 'text/csv',
    MARKDOWN: 'text/markdown',
  },

  // Archive types
  ARCHIVE: {
    ZIP: 'application/zip',
    RAR: 'application/x-rar-compressed',
    TAR: 'application/x-tar',
    GZ: 'application/gzip',
    BZ2: 'application/x-bzip2',
    SEVEN_Z: 'application/x-7z-compressed',
  },

  // Other types
  OTHER: {
    BINARY: 'application/octet-stream',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
  },
} as const;

// File extensions mapping
export const FILE_EXTENSIONS = {
  // Image extensions
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/x-icon': 'ico',

  // Video extensions
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
  'video/x-msvideo': 'avi',
  'video/quicktime': 'mov',
  'video/x-ms-wmv': 'wmv',
  'video/x-flv': 'flv',
  'video/x-matroska': 'mkv',

  // Audio extensions
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/webm': 'webm',
  'audio/m4a': 'm4a',
  'audio/x-ms-wma': 'wma',

  // Document extensions
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/rtf': 'rtf',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',

  // Text extensions
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/csv': 'csv',
  'text/markdown': 'md',

  // Archive extensions
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-tar': 'tar',
  'application/gzip': 'gz',
  'application/x-bzip2': 'bz2',
  'application/x-7z-compressed': '7z',
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  // Image limits
  AVATAR: 5 * 1024 * 1024, // 5MB
  IMAGE_MESSAGE: 10 * 1024 * 1024, // 10MB

  // Video limits
  VIDEO_MESSAGE: 100 * 1024 * 1024, // 100MB

  // Audio limits
  AUDIO_MESSAGE: 25 * 1024 * 1024, // 25MB

  // Document limits
  DOCUMENT: 50 * 1024 * 1024, // 50MB

  // General limits
  GENERAL: 25 * 1024 * 1024, // 25MB
  LARGE_FILE: 500 * 1024 * 1024, // 500MB
} as const;

// File validation categories
export const FILE_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  TEXT: 'text',
  ARCHIVE: 'archive',
  OTHER: 'other',
} as const;

// Allowed file types for different features
export const ALLOWED_FILE_TYPES = {
  AVATAR: [
    FILE_TYPES.IMAGE.JPEG,
    FILE_TYPES.IMAGE.JPG,
    FILE_TYPES.IMAGE.PNG,
    FILE_TYPES.IMAGE.WEBP,
  ],

  CHAT_IMAGES: [
    FILE_TYPES.IMAGE.JPEG,
    FILE_TYPES.IMAGE.JPG,
    FILE_TYPES.IMAGE.PNG,
    FILE_TYPES.IMAGE.GIF,
    FILE_TYPES.IMAGE.WEBP,
  ],

  CHAT_VIDEOS: [
    FILE_TYPES.VIDEO.MP4,
    FILE_TYPES.VIDEO.WEBM,
    FILE_TYPES.VIDEO.MOV,
  ],

  CHAT_AUDIO: [
    FILE_TYPES.AUDIO.MP3,
    FILE_TYPES.AUDIO.WAV,
    FILE_TYPES.AUDIO.OGG,
    FILE_TYPES.AUDIO.WEBM,
  ],

  CHAT_DOCUMENTS: [
    FILE_TYPES.DOCUMENT.PDF,
    FILE_TYPES.DOCUMENT.DOC,
    FILE_TYPES.DOCUMENT.DOCX,
    FILE_TYPES.DOCUMENT.XLS,
    FILE_TYPES.DOCUMENT.XLSX,
    FILE_TYPES.DOCUMENT.PPT,
    FILE_TYPES.DOCUMENT.PPTX,
    FILE_TYPES.TEXT.PLAIN,
  ],

  ALL_MEDIA: [
    ...Object.values(FILE_TYPES.IMAGE),
    ...Object.values(FILE_TYPES.VIDEO),
    ...Object.values(FILE_TYPES.AUDIO),
  ],

  ALL_FILES: [
    ...Object.values(FILE_TYPES.IMAGE),
    ...Object.values(FILE_TYPES.VIDEO),
    ...Object.values(FILE_TYPES.AUDIO),
    ...Object.values(FILE_TYPES.DOCUMENT),
    ...Object.values(FILE_TYPES.TEXT),
  ],
} as const;

// File type detection patterns
export const FILE_TYPE_PATTERNS = {
  IMAGE: /^image\//,
  VIDEO: /^video\//,
  AUDIO: /^audio\//,
  TEXT: /^text\//,
  APPLICATION: /^application\//,
} as const;

// Default file prefixes for naming
export const FILE_PREFIXES = {
  AVATAR: 'avatar',
  CHAT_IMAGE: 'chat-image',
  CHAT_VIDEO: 'chat-video',
  CHAT_AUDIO: 'chat-audio',
  CHAT_DOCUMENT: 'chat-document',
  TEMP: 'temp',
  BACKUP: 'backup',
  EXPORT: 'export',
} as const;

// File quality settings
export const FILE_QUALITY = {
  THUMBNAIL: {
    WIDTH: 150,
    HEIGHT: 150,
    QUALITY: 0.7,
  },
  PREVIEW: {
    WIDTH: 400,
    HEIGHT: 400,
    QUALITY: 0.8,
  },
  MEDIUM: {
    WIDTH: 800,
    HEIGHT: 600,
    QUALITY: 0.85,
  },
  HIGH: {
    WIDTH: 1920,
    HEIGHT: 1080,
    QUALITY: 0.9,
  },
} as const;

// File processing states
export const FILE_PROCESSING_STATES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Helper functions for file type validation
export const isImageFile = (mimeType: string): boolean => {
  return FILE_TYPE_PATTERNS.IMAGE.test(mimeType);
};

export const isVideoFile = (mimeType: string): boolean => {
  return FILE_TYPE_PATTERNS.VIDEO.test(mimeType);
};

export const isAudioFile = (mimeType: string): boolean => {
  return FILE_TYPE_PATTERNS.AUDIO.test(mimeType);
};

export const isTextFile = (mimeType: string): boolean => {
  return FILE_TYPE_PATTERNS.TEXT.test(mimeType);
};

export const getFileExtension = (mimeType: string): string => {
  return FILE_EXTENSIONS[mimeType as keyof typeof FILE_EXTENSIONS] || 'bin';
};

export const getFileCategory = (mimeType: string): string => {
  if (isImageFile(mimeType)) return FILE_CATEGORIES.IMAGE;
  if (isVideoFile(mimeType)) return FILE_CATEGORIES.VIDEO;
  if (isAudioFile(mimeType)) return FILE_CATEGORIES.AUDIO;
  if (isTextFile(mimeType)) return FILE_CATEGORIES.TEXT;
  if ((Object.values(FILE_TYPES.DOCUMENT) as string[]).includes(mimeType))
    return FILE_CATEGORIES.DOCUMENT;
  if ((Object.values(FILE_TYPES.ARCHIVE) as string[]).includes(mimeType))
    return FILE_CATEGORIES.ARCHIVE;
  return FILE_CATEGORIES.OTHER;
};

// Helper types
export type FileType =
  (typeof FILE_TYPES)[keyof typeof FILE_TYPES][keyof (typeof FILE_TYPES)[keyof typeof FILE_TYPES]];
export type FileCategory =
  (typeof FILE_CATEGORIES)[keyof typeof FILE_CATEGORIES];
export type FilePrefix = (typeof FILE_PREFIXES)[keyof typeof FILE_PREFIXES];
export type FileProcessingState =
  (typeof FILE_PROCESSING_STATES)[keyof typeof FILE_PROCESSING_STATES];
