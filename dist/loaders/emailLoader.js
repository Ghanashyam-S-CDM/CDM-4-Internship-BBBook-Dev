"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgMail = exports.emailCryptr = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
exports.sgMail = mail_1.default;
const cryptr_1 = __importDefault(require("cryptr"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.emailCryptr = new cryptr_1.default(process.env.EMAIL_SECRET);
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
//# sourceMappingURL=emailLoader.js.map