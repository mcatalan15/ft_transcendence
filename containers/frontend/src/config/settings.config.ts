import { SettingsConfig } from '../types/settings.types';

export const CAMERA_SVG = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
  <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.293-.293A1 1 0 0013.414 4H6.586a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
</svg>`;

export const SPINNER_SVG = `<svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>`;

export const CAMERA_BUTTON_STYLES = {
  base: {
    position: 'absolute' as const,
    bottom: '-8px',
    right: '-8px',
    width: '48px',
    height: '48px',
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    borderRadius: '50%',
    border: '3px solid #FFFBEB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: '10',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  hover: {
    transform: 'scale(1.1)',
    backgroundColor: '#D97706',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
  }
};

export const CONFIG: SettingsConfig = {
  BORDER_VALUES: {
    mobile: 8,
    desktop: 16
  },
  FILE_UPLOAD: {
    maxSize: 2 * 1024 * 1024,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    acceptedString: 'image/jpeg,image/png,image/gif'
  },
  BREAKPOINTS: {
    mobile: 768
  },
  MULTIPLIERS: {
    mobile: 3.2,
    desktop: 3.4
  },
  STYLES: {
    pongBoxMarginTop: '-16px'
  },
  TRANSITIONS: {
    fadeOutDelay: 300,
    messageDisplayTime: 3000
  }
} as const;