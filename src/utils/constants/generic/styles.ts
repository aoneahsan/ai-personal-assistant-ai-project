// CSS class constants for consistent styling
export const CSS_CLASSES = {
  // Typography
  TYPOGRAPHY: {
    HEADING_XL: 'text-4xl font-bold',
    HEADING_LARGE: 'text-3xl font-bold',
    HEADING_MEDIUM: 'text-2xl font-bold',
    HEADING_SMALL: 'text-xl font-bold',
    HEADING_TINY: 'text-lg font-bold',
    TEXT_LARGE: 'text-lg',
    TEXT_MEDIUM: 'text-base',
    TEXT_SMALL: 'text-sm',
    TEXT_TINY: 'text-xs',
    TEXT_BOLD: 'font-bold',
    TEXT_SEMIBOLD: 'font-semibold',
    TEXT_MEDIUM_WEIGHT: 'font-medium',
    TEXT_NORMAL: 'font-normal',
    TEXT_LIGHT: 'font-light',
    TEXT_ITALIC: 'italic',
    TEXT_UNDERLINE: 'underline',
    TEXT_UPPERCASE: 'uppercase',
    TEXT_LOWERCASE: 'lowercase',
    TEXT_CAPITALIZE: 'capitalize',
    TEXT_CENTER: 'text-center',
    TEXT_LEFT: 'text-left',
    TEXT_RIGHT: 'text-right',
    TEXT_JUSTIFY: 'text-justify',
  },

  // Layout
  LAYOUT: {
    CONTAINER: 'container mx-auto px-4',
    WRAPPER: 'w-full',
    CONTENT: 'flex-1',
    SIDEBAR: 'w-64 h-full',
    MAIN: 'flex-1 p-4',
    HEADER: 'w-full py-4 px-6',
    FOOTER: 'w-full py-4 px-6',
    FULL_WIDTH: 'w-full',
    FULL_HEIGHT: 'h-full',
    FULL_SCREEN: 'w-screen h-screen',
    MAX_WIDTH_SM: 'max-w-sm',
    MAX_WIDTH_MD: 'max-w-md',
    MAX_WIDTH_LG: 'max-w-lg',
    MAX_WIDTH_XL: 'max-w-xl',
    MAX_WIDTH_2XL: 'max-w-2xl',
    MAX_WIDTH_4XL: 'max-w-4xl',
    MAX_WIDTH_6XL: 'max-w-6xl',
    MAX_WIDTH_FULL: 'max-w-full',
  },

  // Flexbox
  FLEX: {
    FLEX: 'flex',
    INLINE_FLEX: 'inline-flex',
    FLEX_COL: 'flex-col',
    FLEX_ROW: 'flex-row',
    FLEX_WRAP: 'flex-wrap',
    FLEX_NOWRAP: 'flex-nowrap',
    FLEX_REVERSE: 'flex-row-reverse',
    FLEX_COL_REVERSE: 'flex-col-reverse',
    JUSTIFY_CENTER: 'justify-center',
    JUSTIFY_START: 'justify-start',
    JUSTIFY_END: 'justify-end',
    JUSTIFY_BETWEEN: 'justify-between',
    JUSTIFY_AROUND: 'justify-around',
    JUSTIFY_EVENLY: 'justify-evenly',
    ITEMS_CENTER: 'items-center',
    ITEMS_START: 'items-start',
    ITEMS_END: 'items-end',
    ITEMS_STRETCH: 'items-stretch',
    ITEMS_BASELINE: 'items-baseline',
    CONTENT_CENTER: 'content-center',
    CONTENT_START: 'content-start',
    CONTENT_END: 'content-end',
    CONTENT_BETWEEN: 'content-between',
    CONTENT_AROUND: 'content-around',
    FLEX_1: 'flex-1',
    FLEX_AUTO: 'flex-auto',
    FLEX_INITIAL: 'flex-initial',
    FLEX_NONE: 'flex-none',
    GROW: 'flex-grow',
    SHRINK: 'flex-shrink',
    NO_SHRINK: 'flex-shrink-0',
  },

  // Grid
  GRID: {
    GRID: 'grid',
    GRID_COLS_1: 'grid-cols-1',
    GRID_COLS_2: 'grid-cols-2',
    GRID_COLS_3: 'grid-cols-3',
    GRID_COLS_4: 'grid-cols-4',
    GRID_COLS_6: 'grid-cols-6',
    GRID_COLS_12: 'grid-cols-12',
    COL_SPAN_1: 'col-span-1',
    COL_SPAN_2: 'col-span-2',
    COL_SPAN_3: 'col-span-3',
    COL_SPAN_4: 'col-span-4',
    COL_SPAN_6: 'col-span-6',
    COL_SPAN_12: 'col-span-12',
    GAP_1: 'gap-1',
    GAP_2: 'gap-2',
    GAP_3: 'gap-3',
    GAP_4: 'gap-4',
    GAP_6: 'gap-6',
    GAP_8: 'gap-8',
  },

  // Spacing
  SPACING: {
    // Padding
    P_0: 'p-0',
    P_1: 'p-1',
    P_2: 'p-2',
    P_3: 'p-3',
    P_4: 'p-4',
    P_5: 'p-5',
    P_6: 'p-6',
    P_8: 'p-8',
    PX_2: 'px-2',
    PX_3: 'px-3',
    PX_4: 'px-4',
    PX_6: 'px-6',
    PX_8: 'px-8',
    PY_2: 'py-2',
    PY_3: 'py-3',
    PY_4: 'py-4',
    PY_6: 'py-6',
    PY_8: 'py-8',

    // Margin
    M_0: 'm-0',
    M_1: 'm-1',
    M_2: 'm-2',
    M_3: 'm-3',
    M_4: 'm-4',
    M_5: 'm-5',
    M_6: 'm-6',
    M_8: 'm-8',
    MX_2: 'mx-2',
    MX_3: 'mx-3',
    MX_4: 'mx-4',
    MX_6: 'mx-6',
    MX_8: 'mx-8',
    MX_AUTO: 'mx-auto',
    MY_2: 'my-2',
    MY_3: 'my-3',
    MY_4: 'my-4',
    MY_6: 'my-6',
    MY_8: 'my-8',
    MB_2: 'mb-2',
    MB_3: 'mb-3',
    MB_4: 'mb-4',
    MB_6: 'mb-6',
    MB_8: 'mb-8',
    MT_2: 'mt-2',
    MT_3: 'mt-3',
    MT_4: 'mt-4',
    MT_6: 'mt-6',
    MT_8: 'mt-8',
    ML_2: 'ml-2',
    ML_3: 'ml-3',
    ML_4: 'ml-4',
    MR_2: 'mr-2',
    MR_3: 'mr-3',
    MR_4: 'mr-4',
  },

  // Colors
  COLORS: {
    // Text colors
    TEXT_PRIMARY: 'text-primary',
    TEXT_SECONDARY: 'text-secondary',
    TEXT_SUCCESS: 'text-success',
    TEXT_WARNING: 'text-warning',
    TEXT_ERROR: 'text-error',
    TEXT_INFO: 'text-info',
    TEXT_MUTED: 'text-muted',
    TEXT_WHITE: 'text-white',
    TEXT_BLACK: 'text-black',
    TEXT_GRAY_500: 'text-gray-500',
    TEXT_GRAY_600: 'text-gray-600',
    TEXT_GRAY_700: 'text-gray-700',
    TEXT_GRAY_800: 'text-gray-800',
    TEXT_GRAY_900: 'text-gray-900',
    TEXT_BLUE_500: 'text-blue-500',
    TEXT_BLUE_600: 'text-blue-600',
    TEXT_GREEN_500: 'text-green-500',
    TEXT_GREEN_600: 'text-green-600',
    TEXT_RED_500: 'text-red-500',
    TEXT_RED_600: 'text-red-600',
    TEXT_YELLOW_500: 'text-yellow-500',
    TEXT_YELLOW_600: 'text-yellow-600',
    TEXT_PURPLE_500: 'text-purple-500',
    TEXT_PURPLE_600: 'text-purple-600',
    TEXT_ORANGE_500: 'text-orange-500',
    TEXT_ORANGE_600: 'text-orange-600',
    TEXT_TEAL_500: 'text-teal-500',
    TEXT_TEAL_600: 'text-teal-600',
    TEXT_INDIGO_500: 'text-indigo-500',
    TEXT_INDIGO_600: 'text-indigo-600',

    // Background colors
    BG_PRIMARY: 'bg-primary',
    BG_SECONDARY: 'bg-secondary',
    BG_SUCCESS: 'bg-success',
    BG_WARNING: 'bg-warning',
    BG_ERROR: 'bg-error',
    BG_INFO: 'bg-info',
    BG_WHITE: 'bg-white',
    BG_BLACK: 'bg-black',
    BG_GRAY_50: 'bg-gray-50',
    BG_GRAY_100: 'bg-gray-100',
    BG_GRAY_200: 'bg-gray-200',
    BG_GRAY_300: 'bg-gray-300',
    BG_BLUE_50: 'bg-blue-50',
    BG_BLUE_100: 'bg-blue-100',
    BG_GREEN_50: 'bg-green-50',
    BG_GREEN_100: 'bg-green-100',
    BG_RED_50: 'bg-red-50',
    BG_RED_100: 'bg-red-100',
  },

  // Borders
  BORDERS: {
    BORDER: 'border',
    BORDER_0: 'border-0',
    BORDER_1: 'border-1',
    BORDER_2: 'border-2',
    BORDER_4: 'border-4',
    BORDER_T: 'border-t',
    BORDER_R: 'border-r',
    BORDER_B: 'border-b',
    BORDER_L: 'border-l',
    BORDER_SOLID: 'border-solid',
    BORDER_DASHED: 'border-dashed',
    BORDER_DOTTED: 'border-dotted',
    BORDER_GRAY_200: 'border-gray-200',
    BORDER_GRAY_300: 'border-gray-300',
    BORDER_GRAY_400: 'border-gray-400',
    BORDER_PRIMARY: 'border-primary',
    BORDER_SECONDARY: 'border-secondary',
    BORDER_SUCCESS: 'border-success',
    BORDER_WARNING: 'border-warning',
    BORDER_ERROR: 'border-error',
    BORDER_INFO: 'border-info',
    ROUNDED_NONE: 'rounded-none',
    ROUNDED_SM: 'rounded-sm',
    ROUNDED: 'rounded',
    ROUNDED_MD: 'rounded-md',
    ROUNDED_LG: 'rounded-lg',
    ROUNDED_XL: 'rounded-xl',
    ROUNDED_2XL: 'rounded-2xl',
    ROUNDED_3XL: 'rounded-3xl',
    ROUNDED_FULL: 'rounded-full',
    ROUNDED_T: 'rounded-t',
    ROUNDED_R: 'rounded-r',
    ROUNDED_B: 'rounded-b',
    ROUNDED_L: 'rounded-l',
  },

  // Shadows
  SHADOWS: {
    SHADOW_NONE: 'shadow-none',
    SHADOW_SM: 'shadow-sm',
    SHADOW: 'shadow',
    SHADOW_MD: 'shadow-md',
    SHADOW_LG: 'shadow-lg',
    SHADOW_XL: 'shadow-xl',
    SHADOW_2XL: 'shadow-2xl',
    SHADOW_3XL: 'shadow-3xl',
    SHADOW_INNER: 'shadow-inner',
    DROP_SHADOW_SM: 'drop-shadow-sm',
    DROP_SHADOW: 'drop-shadow',
    DROP_SHADOW_MD: 'drop-shadow-md',
    DROP_SHADOW_LG: 'drop-shadow-lg',
    DROP_SHADOW_XL: 'drop-shadow-xl',
    DROP_SHADOW_2XL: 'drop-shadow-2xl',
  },

  // Positioning
  POSITIONING: {
    STATIC: 'static',
    FIXED: 'fixed',
    ABSOLUTE: 'absolute',
    RELATIVE: 'relative',
    STICKY: 'sticky',
    TOP_0: 'top-0',
    TOP_1: 'top-1',
    TOP_2: 'top-2',
    TOP_4: 'top-4',
    RIGHT_0: 'right-0',
    RIGHT_1: 'right-1',
    RIGHT_2: 'right-2',
    RIGHT_4: 'right-4',
    BOTTOM_0: 'bottom-0',
    BOTTOM_1: 'bottom-1',
    BOTTOM_2: 'bottom-2',
    BOTTOM_4: 'bottom-4',
    LEFT_0: 'left-0',
    LEFT_1: 'left-1',
    LEFT_2: 'left-2',
    LEFT_4: 'left-4',
    INSET_0: 'inset-0',
    INSET_1: 'inset-1',
    INSET_2: 'inset-2',
    INSET_4: 'inset-4',
  },

  // Z-index
  Z_INDEX: {
    Z_0: 'z-0',
    Z_10: 'z-10',
    Z_20: 'z-20',
    Z_30: 'z-30',
    Z_40: 'z-40',
    Z_50: 'z-50',
    Z_AUTO: 'z-auto',
  },

  // Visibility
  VISIBILITY: {
    VISIBLE: 'visible',
    INVISIBLE: 'invisible',
    HIDDEN: 'hidden',
    BLOCK: 'block',
    INLINE: 'inline',
    INLINE_BLOCK: 'inline-block',
    FLEX: 'flex',
    INLINE_FLEX: 'inline-flex',
    GRID: 'grid',
    INLINE_GRID: 'inline-grid',
    TABLE: 'table',
    TABLE_CELL: 'table-cell',
    TABLE_ROW: 'table-row',
  },

  // Interactions
  INTERACTIONS: {
    CURSOR_POINTER: 'cursor-pointer',
    CURSOR_DEFAULT: 'cursor-default',
    CURSOR_WAIT: 'cursor-wait',
    CURSOR_TEXT: 'cursor-text',
    CURSOR_MOVE: 'cursor-move',
    CURSOR_NOT_ALLOWED: 'cursor-not-allowed',
    POINTER_EVENTS_NONE: 'pointer-events-none',
    POINTER_EVENTS_AUTO: 'pointer-events-auto',
    SELECT_NONE: 'select-none',
    SELECT_TEXT: 'select-text',
    SELECT_ALL: 'select-all',
    SELECT_AUTO: 'select-auto',
  },

  // Transitions
  TRANSITIONS: {
    TRANSITION_NONE: 'transition-none',
    TRANSITION_ALL: 'transition-all',
    TRANSITION: 'transition',
    TRANSITION_COLORS: 'transition-colors',
    TRANSITION_OPACITY: 'transition-opacity',
    TRANSITION_SHADOW: 'transition-shadow',
    TRANSITION_TRANSFORM: 'transition-transform',
    DURATION_75: 'duration-75',
    DURATION_100: 'duration-100',
    DURATION_150: 'duration-150',
    DURATION_200: 'duration-200',
    DURATION_300: 'duration-300',
    DURATION_500: 'duration-500',
    DURATION_700: 'duration-700',
    DURATION_1000: 'duration-1000',
    EASE_LINEAR: 'ease-linear',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },

  // Transforms
  TRANSFORMS: {
    TRANSFORM: 'transform',
    TRANSFORM_GPU: 'transform-gpu',
    TRANSFORM_NONE: 'transform-none',
    TRANSLATE_X_0: 'translate-x-0',
    TRANSLATE_X_1: 'translate-x-1',
    TRANSLATE_X_2: 'translate-x-2',
    TRANSLATE_Y_0: 'translate-y-0',
    TRANSLATE_Y_1: 'translate-y-1',
    TRANSLATE_Y_2: 'translate-y-2',
    SCALE_0: 'scale-0',
    SCALE_50: 'scale-50',
    SCALE_75: 'scale-75',
    SCALE_90: 'scale-90',
    SCALE_95: 'scale-95',
    SCALE_100: 'scale-100',
    SCALE_105: 'scale-105',
    SCALE_110: 'scale-110',
    SCALE_125: 'scale-125',
    SCALE_150: 'scale-150',
    ROTATE_0: 'rotate-0',
    ROTATE_1: 'rotate-1',
    ROTATE_2: 'rotate-2',
    ROTATE_3: 'rotate-3',
    ROTATE_6: 'rotate-6',
    ROTATE_12: 'rotate-12',
    ROTATE_45: 'rotate-45',
    ROTATE_90: 'rotate-90',
    ROTATE_180: 'rotate-180',
  },

  // Responsive
  RESPONSIVE: {
    SM: 'sm:',
    MD: 'md:',
    LG: 'lg:',
    XL: 'xl:',
    XXL: '2xl:',
    MOBILE_ONLY: 'sm:hidden',
    TABLET_ONLY: 'hidden sm:block lg:hidden',
    DESKTOP_ONLY: 'hidden lg:block',
    MOBILE_HIDDEN: 'hidden sm:block',
    TABLET_HIDDEN: 'sm:hidden lg:block',
    DESKTOP_HIDDEN: 'lg:hidden',
  },

  // State classes
  STATES: {
    HOVER: 'hover:',
    FOCUS: 'focus:',
    ACTIVE: 'active:',
    DISABLED: 'disabled:',
    VISITED: 'visited:',
    FIRST: 'first:',
    LAST: 'last:',
    ODD: 'odd:',
    EVEN: 'even:',
    FOCUS_WITHIN: 'focus-within:',
    FOCUS_VISIBLE: 'focus-visible:',
    GROUP_HOVER: 'group-hover:',
    GROUP_FOCUS: 'group-focus:',
  },

  // Utility classes
  UTILITIES: {
    OVERFLOW_HIDDEN: 'overflow-hidden',
    OVERFLOW_VISIBLE: 'overflow-visible',
    OVERFLOW_AUTO: 'overflow-auto',
    OVERFLOW_SCROLL: 'overflow-scroll',
    OVERFLOW_X_HIDDEN: 'overflow-x-hidden',
    OVERFLOW_X_AUTO: 'overflow-x-auto',
    OVERFLOW_X_SCROLL: 'overflow-x-scroll',
    OVERFLOW_Y_HIDDEN: 'overflow-y-hidden',
    OVERFLOW_Y_AUTO: 'overflow-y-auto',
    OVERFLOW_Y_SCROLL: 'overflow-y-scroll',
    WHITESPACE_NORMAL: 'whitespace-normal',
    WHITESPACE_NOWRAP: 'whitespace-nowrap',
    WHITESPACE_PRE: 'whitespace-pre',
    WHITESPACE_PRE_LINE: 'whitespace-pre-line',
    WHITESPACE_PRE_WRAP: 'whitespace-pre-wrap',
    TRUNCATE: 'truncate',
    TEXT_ELLIPSIS: 'text-ellipsis',
    TEXT_CLIP: 'text-clip',
    BREAK_NORMAL: 'break-normal',
    BREAK_WORDS: 'break-words',
    BREAK_ALL: 'break-all',
    OPACITY_0: 'opacity-0',
    OPACITY_25: 'opacity-25',
    OPACITY_50: 'opacity-50',
    OPACITY_75: 'opacity-75',
    OPACITY_100: 'opacity-100',
  },
} as const;

// Component-specific style combinations
export const COMPONENT_STYLES = {
  // Card styles
  CARD: {
    BASE: 'bg-white shadow-lg rounded-lg p-6',
    COMPACT: 'bg-white shadow-md rounded-lg p-4',
    BORDERED: 'bg-white border border-gray-200 rounded-lg p-6',
    ELEVATED: 'bg-white shadow-xl rounded-xl p-6',
    INTERACTIVE:
      'bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer',
  },

  // Button styles
  BUTTON: {
    PRIMARY:
      'bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors',
    SECONDARY:
      'bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark transition-colors',
    SUCCESS:
      'bg-success text-white px-4 py-2 rounded-md hover:bg-success-dark transition-colors',
    WARNING:
      'bg-warning text-white px-4 py-2 rounded-md hover:bg-warning-dark transition-colors',
    ERROR:
      'bg-error text-white px-4 py-2 rounded-md hover:bg-error-dark transition-colors',
    INFO: 'bg-info text-white px-4 py-2 rounded-md hover:bg-info-dark transition-colors',
    OUTLINE:
      'border-2 border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-colors',
    GHOST:
      'text-primary px-4 py-2 rounded-md hover:bg-primary-light transition-colors',
    LINK: 'text-primary underline hover:text-primary-dark transition-colors',
    ROUNDED: 'px-6 py-3 rounded-full font-semibold transition-all duration-200',
    ICON: 'p-2 rounded-full hover:bg-gray-100 transition-colors',
  },

  // Input styles
  INPUT: {
    BASE: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    ERROR:
      'border border-red-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
    SUCCESS:
      'border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
    LARGE:
      'border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    SMALL:
      'border border-gray-300 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
  },

  // Modal styles
  MODAL: {
    BACKDROP:
      'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center',
    CONTAINER: 'bg-white rounded-lg shadow-xl max-w-md mx-auto p-6',
    HEADER: 'flex items-center justify-between mb-4',
    TITLE: 'text-lg font-semibold text-gray-900',
    BODY: 'text-gray-700 mb-6',
    FOOTER: 'flex items-center justify-end space-x-2',
  },

  // Table styles
  TABLE: {
    CONTAINER: 'overflow-x-auto shadow-md rounded-lg',
    TABLE: 'min-w-full divide-y divide-gray-200',
    HEADER: 'bg-gray-50',
    HEADER_CELL:
      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    BODY: 'bg-white divide-y divide-gray-200',
    ROW: 'hover:bg-gray-50 transition-colors',
    CELL: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  },

  // Form styles
  FORM: {
    CONTAINER: 'space-y-6',
    FIELD: 'space-y-2',
    LABEL: 'block text-sm font-medium text-gray-700',
    ERROR: 'text-sm text-red-600 mt-1',
    HELP: 'text-sm text-gray-500 mt-1',
    ACTIONS: 'flex items-center justify-end space-x-2 pt-4',
  },

  // Alert styles
  ALERT: {
    SUCCESS:
      'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md',
    WARNING:
      'bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md',
    ERROR: 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md',
    INFO: 'bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md',
  },

  // Badge styles
  BADGE: {
    PRIMARY: 'bg-primary text-white px-2 py-1 rounded-full text-xs font-medium',
    SECONDARY:
      'bg-secondary text-white px-2 py-1 rounded-full text-xs font-medium',
    SUCCESS:
      'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
    WARNING:
      'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
    ERROR: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
    INFO: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
  },

  // Loading styles
  LOADING: {
    SPINNER:
      'animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full',
    PULSE: 'animate-pulse bg-gray-200 rounded',
    SKELETON: 'animate-pulse bg-gray-300 rounded',
  },

  // Dashboard styles
  DASHBOARD: {
    CONTAINER: 'min-h-screen bg-gray-50',
    SIDEBAR: 'bg-white shadow-sm border-r border-gray-200 w-64 fixed h-full',
    MAIN: 'ml-64 p-6',
    HEADER: 'bg-white shadow-sm border-b border-gray-200 px-6 py-4',
    CARD: 'bg-white shadow-sm border border-gray-200 rounded-lg p-6',
    STATS_CARD:
      'bg-white shadow-sm border border-gray-200 rounded-lg p-6 text-center',
  },

  // Chat styles
  CHAT: {
    CONTAINER: 'flex flex-col h-full',
    HEADER:
      'bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between',
    MESSAGES: 'flex-1 overflow-y-auto p-4 space-y-2',
    MESSAGE_SENT:
      'bg-blue-500 text-white px-3 py-2 rounded-lg ml-auto max-w-xs',
    MESSAGE_RECEIVED:
      'bg-gray-200 text-gray-900 px-3 py-2 rounded-lg mr-auto max-w-xs',
    INPUT: 'border-t border-gray-200 px-4 py-3 flex items-center space-x-2',
  },
} as const;

// Predefined class combinations for common patterns
export const COMMON_PATTERNS = {
  // Centering patterns
  CENTER_ABSOLUTE:
    'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  CENTER_FLEX: 'flex items-center justify-center',
  CENTER_GRID: 'grid place-items-center',
  CENTER_TEXT: 'text-center',

  // Layout patterns
  FULL_SCREEN: 'w-screen h-screen',
  FULL_WIDTH: 'w-full',
  FULL_HEIGHT: 'h-full',
  CONTAINER: 'container mx-auto px-4',
  SECTION: 'py-12 px-4',

  // Spacing patterns
  SPACE_Y_SMALL: 'space-y-2',
  SPACE_Y_MEDIUM: 'space-y-4',
  SPACE_Y_LARGE: 'space-y-6',
  SPACE_X_SMALL: 'space-x-2',
  SPACE_X_MEDIUM: 'space-x-4',
  SPACE_X_LARGE: 'space-x-6',

  // Interactive patterns
  CLICKABLE: 'cursor-pointer hover:opacity-80 transition-opacity',
  BUTTON_HOVER: 'hover:scale-105 transition-transform',
  CARD_HOVER: 'hover:shadow-lg transition-shadow',
  LINK_HOVER: 'hover:underline transition-all',

  // Status patterns
  LOADING: 'animate-pulse bg-gray-200',
  DISABLED: 'opacity-50 cursor-not-allowed',
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  FADE_IN: 'animate-fade-in',
  FADE_OUT: 'animate-fade-out',

  // Responsive patterns
  RESPONSIVE_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  RESPONSIVE_FLEX: 'flex flex-col md:flex-row',
  RESPONSIVE_PADDING: 'px-4 md:px-6 lg:px-8',
  RESPONSIVE_TEXT: 'text-sm md:text-base lg:text-lg',

  // Form patterns
  FORM_GROUP: 'space-y-2',
  FORM_ACTIONS: 'flex items-center justify-end space-x-2 pt-4',
  FORM_ERROR: 'text-red-500 text-sm mt-1',
  FORM_HELP: 'text-gray-500 text-sm mt-1',

  // Card patterns
  CARD_BASIC: 'bg-white shadow-md rounded-lg p-6',
  CARD_ELEVATED: 'bg-white shadow-lg rounded-lg p-6',
  CARD_INTERACTIVE:
    'bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer',
  CARD_BORDERED: 'bg-white border border-gray-200 rounded-lg p-6',
} as const;

// Export types for better TypeScript support
export type CSSClass = string;
export type ComponentStyle =
  (typeof COMPONENT_STYLES)[keyof typeof COMPONENT_STYLES][keyof (typeof COMPONENT_STYLES)[keyof typeof COMPONENT_STYLES]];
export type CommonPattern =
  (typeof COMMON_PATTERNS)[keyof typeof COMMON_PATTERNS];
