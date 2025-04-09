import { createContext, useContext, useState, useEffect } from 'react';

type Settings = {
  autoLockTimeout: number; // in minutes
};

const defaultSettings: Settings = {
  autoLockTimeout: 5
};

const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
