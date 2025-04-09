"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometricUnlock = BiometricUnlock;
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
function BiometricUnlock({ onUnlock }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleUnlock = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (window.electron) {
                const success = await window.electron.invoke('show-biometric-dialog');
                if (!success) {
                    throw new Error('Authentication cancelled');
                }
            }
            await onUnlock();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="flex flex-col items-center space-y-4">
      <button onClick={handleUnlock} disabled={isLoading} className={`p-4 rounded-full ${isLoading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
        <fa_1.FaFingerprint className="text-white text-3xl"/>
      </button>
      
      {isLoading && (<p className="text-gray-400">Authenticating...</p>)}
      
      {error && (<p className="text-red-500">{error}</p>)}

      <p className="text-sm text-gray-400">
        Use your device's biometric authentication
      </p>
    </div>);
}
