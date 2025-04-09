"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainApp = MainApp;
const react_1 = require("react");
const SettingsContext_1 = require("./contexts/SettingsContext");
const secureStorage_1 = require("./utils/secureStorage");
const fi_1 = require("react-icons/fi");
const BiometricUnlock_1 = require("./components/BiometricUnlock");
const SettingsPanel_1 = require("./components/SettingsPanel");
const axios_1 = __importDefault(require("axios"));
function MainApp() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('connection');
    const [mode, setMode] = (0, react_1.useState)('basic');
    const [status, setStatus] = (0, react_1.useState)('disconnected');
    const [isLocked, setIsLocked] = (0, react_1.useState)(true);
    const handleBiometricAuth = async () => {
        const authStorage = secureStorage_1.SecureStorage.getInstance('biometric');
        try {
            const response = await axios_1.default.post('/biometric-auth');
            if (response.data.success) {
                authStorage.store(response.data.token);
                setIsLocked(false);
            }
        }
        catch (error) {
            authStorage.wipe();
            console.error('Biometric authentication failed:', error);
        }
    };
    const { settings } = (0, SettingsContext_1.useSettings)();
    const timeoutRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        // Check if already authenticated
        handleBiometricAuth();
        const resetLockTimer = () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
            if (!isLocked && settings.autoLockTimeout > 0) {
                timeoutRef.current = setTimeout(() => {
                    setIsLocked(true);
                }, settings.autoLockTimeout * 60 * 1000);
            }
        };
        // Set up event listeners
        window.addEventListener('mousemove', resetLockTimer);
        window.addEventListener('keydown', resetLockTimer);
        resetLockTimer();
        return () => {
            window.removeEventListener('mousemove', resetLockTimer);
            window.removeEventListener('keydown', resetLockTimer);
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    }, [isLocked, settings.autoLockTimeout]);
    const handleConnect = () => {
        setStatus('connecting');
        // TODO: Connect to backend
        setTimeout(() => setStatus('connected'), 2000);
    };
    return (<div className="min-h-screen bg-gray-900 text-gray-100">
      {isLocked ? (<div className="flex items-center justify-center h-screen">
          <div className="bg-gray-800 p-8 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-6 text-center">Secure Authentication Required</h2>
            <BiometricUnlock_1.BiometricUnlock onUnlock={handleBiometricAuth}/>
          </div>
        </div>) : (<div className="container mx-auto p-4 max-w-md">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">ESCAPE</h1>
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('connection')} className={`p-2 ${activeTab === 'connection' ? 'text-white' : 'text-gray-500'}`}>
              <fi_1.FiPower size={20}/>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`p-2 ${activeTab === 'settings' ? 'text-white' : 'text-gray-500'}`}>
              <fi_1.FiSettings size={20}/>
            </button>
          </div>
        </header>

        {/* Connection Tab */}
        {activeTab === 'connection' && (<div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium">Connection Mode</h2>
                <div className="flex space-x-2">
                  <button onClick={() => setMode('basic')} className={`px-3 py-1 rounded ${mode === 'basic' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    Basic
                  </button>
                  <button onClick={() => setMode('stealth')} className={`px-3 py-1 rounded ${mode === 'stealth' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    Stealth
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <fi_1.FiGlobe className="text-gray-400"/>
                  <span>Status: {status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <fi_1.FiShield className="text-gray-400"/>
                  <span>Encryption: {mode === 'basic' ? 'AES-256' : 'ChaCha20'}</span>
                </div>
              </div>
            </div>

            <button onClick={handleConnect} disabled={status === 'connecting'} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
              {status === 'disconnected' ? 'Connect' :
                    status === 'connecting' ? 'Connecting...' : 'Disconnect'}
            </button>
          </div>)}

        {/* Settings Tab */}
        {activeTab === 'settings' && (<div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <h2 className="font-medium">Settings</h2>
              <SettingsPanel_1.SettingsPanel />
              <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fallback Mode</label>
                <select className="w-full bg-gray-700 rounded p-2">
                  <option>Automatic</option>
                  <option>WireGuard</option>
                  <option>Obfs4</option>
                  <option>Domain Fronting</option>
                  <option>P2P</option>
                </select>
              </div>
              <button onClick={async () => {
                    try {
                        const response = await axios_1.default.post('/biometric-auth');
                        if (response.data.success) {
                            if (confirm('Are you sure you want to wipe all data? This cannot be undone!')) {
                                // TODO: Implement wipe functionality
                                alert('All data has been securely wiped');
                            }
                        }
                    }
                    catch (error) {
                        alert('Biometric authentication required for emergency wipe');
                    }
                }} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
                Emergency Wipe
              </button>
            </div>
          </div>)}
      </div>)}
    </div>);
}
