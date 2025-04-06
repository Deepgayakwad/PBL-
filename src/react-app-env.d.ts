/// <reference types="react-scripts" />

interface Window {
  ENV: {
    REACT_APP_API_URL: string;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
  }
} 