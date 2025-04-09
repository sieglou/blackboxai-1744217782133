"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPanel = SettingsPanel;
const SettingsContext_1 = require("../contexts/SettingsContext");
function SettingsPanel() {
    const { settings, updateSettings } = (0, SettingsContext_1.useSettings)();
    return (<div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Security Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Auto-lock timeout (minutes)
          </label>
          <input type="number" min="1" max="60" value={settings.autoLockTimeout} onChange={(e) => updateSettings({ autoLockTimeout: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
        </div>
      </div>
    </div>);
}
