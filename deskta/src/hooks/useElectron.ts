import { useState, useEffect } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      isElectron: boolean;
      openExternal: (url: string) => void;
    };
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isElectron) {
      setIsElectron(true);
    }
  }, []);

  const openExternal = (url: string) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return {
    isElectron,
    platform: window.electronAPI?.platform,
    openExternal,
  };
};
