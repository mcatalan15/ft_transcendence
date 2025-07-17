interface ResponsiveConfig {
  breakpoints: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  base: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  spacing: {
    headerTopOffset: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
      xxlarge: number;
    };
    borderWidth: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
      xxlarge: number;
    };
  };
  zIndex: {
    header: number;
    content: number;
    overlay: number;
    topBar: number;
  };
  getResponsiveValue: (property: keyof ResponsiveConfig["spacing"], windowWidth: number) => number;
  calculateContainerDimensions: (containerWidth: number) => { width: number; height: number };
}

export const RESPONSIVE_CONFIG = {
  breakpoints: {
    small: 640,
    medium: 768,
    large: 1024,
    xlarge: 1440,
    xxlarge: 1920,
  },
  
  base: {
    width: 1800,
    height: 600,
    aspectRatio: 1800 / 600,
  },
  
  spacing: {
    headerTopOffset: {
      small: -20,
      medium: -30,
      large: -40,
      xlarge: -50,
      xxlarge: -60,
    },
    borderWidth: {
      small: 4,
      medium: 6,
      large: 8, 
      xlarge: 12,
      xxlarge: 16,
    }
  },
  
  zIndex: {
    header: 40,
    content: 30,
    overlay: 50,
    topBar: 60,
  },
  
  getResponsiveValue: function(property: keyof ResponsiveConfig["spacing"], windowWidth: number) {
    if (windowWidth < this.breakpoints.small) return this.spacing[property].small;
    if (windowWidth < this.breakpoints.medium) return this.spacing[property].medium;
    if (windowWidth < this.breakpoints.large) return this.spacing[property].large;
    if (windowWidth < this.breakpoints.xlarge) return this.spacing[property].xlarge;
    return this.spacing[property].xxlarge;
  },
  
  calculateContainerDimensions: function(containerWidth: number) {
    const height = Math.max(250, containerWidth / this.base.aspectRatio);
    return { width: containerWidth, height };
  }
} as ResponsiveConfig;
