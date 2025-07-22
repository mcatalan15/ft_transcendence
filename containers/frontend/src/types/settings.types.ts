export interface UserData {
  username: string;
  id: string;
}

export interface ApiError {
  message?: string;
}

export interface SettingsConfig {
  BORDER_VALUES: {
    desktop: number;
  };
  FILE_UPLOAD: {
    maxSize: number;
    acceptedTypes: string[];
    acceptedString: string;
  };
  MULTIPLIERS: {
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