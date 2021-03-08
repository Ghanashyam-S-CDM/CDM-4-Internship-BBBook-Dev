"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.isDevelopment = (process.env.NODE_ENV === 'development');
let whiteList = [
    'https://bbbook.ca',
    'https://www.bbbook.ca',
];
exports.isDevelopment && (whiteList = [
    ...whiteList,
    // Dev whitelist goes here
    'http://localhost:12541',
]);
console.log(whiteList);
const corsOptions = {
    origin: whiteList,
    credentials: true,
};
exports.default = cors_1.default(corsOptions);
//# sourceMappingURL=corsLoader.js.map