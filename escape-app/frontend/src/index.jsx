"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const SettingsContext_1 = require("./contexts/SettingsContext");
const App_1 = require("./App");
react_dom_1.default.render(<react_1.default.StrictMode>
    <SettingsContext_1.SettingsProvider>
      <App_1.MainApp />
    </SettingsContext_1.SettingsProvider>
  </react_1.default.StrictMode>, document.getElementById('root'));
