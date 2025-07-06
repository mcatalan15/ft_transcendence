export interface UserData {
  username: string;
  id: string;
}

export interface ApiError {
  message?: string;
}

export interface SettingsConfig {
  BORDER_VALUES: {
    mobile: number;
    desktop: number;
  };
  FILE_UPLOAD: {
    maxSize: number;
    acceptedTypes: string[];
    acceptedString: string;
  };
  BREAKPOINTS: {
    mobile: number;
  };
  MULTIPLIERS: {
    mobile: number;
    desktop: number;
  };
  STYLES: {
    pongBoxMarginTop: string;
  };
  TRANSITIONS: {
    fadeOutDelay: number;
    messageDisplayTime: number;
  };
}