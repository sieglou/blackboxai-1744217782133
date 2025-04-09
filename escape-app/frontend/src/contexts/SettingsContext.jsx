"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSettings = void 0;
exports.SettingsProvider = SettingsProvider;
const react_1 = require("react");
const defaultSettings = {
    autoLockTimeout: 5
};
const SettingsContext = (0, react_1.createContext)({
    settings: defaultSettings,
    updateSettings: () => { }
});
function SettingsProvider({ children }) {
    const [settings, setSettings] = (0, react_1.useState)(defaultSettings);
    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };
    return (<SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>);
}
const useSettings = () => (0, react_1.useContext)(SettingsContext);
exports.useSettings = useSettings;
