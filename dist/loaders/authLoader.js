"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCryptr = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cryptr_1 = __importDefault(require("cryptr"));
const http_status_codes_1 = require("http-status-codes");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const User = __importStar(require("../models/ModelUser"));
// TODO: Check messages
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passReqToCallback: true,
}, async (req, email, password, done) => {
    try {
        const user = await User.findByEmailUnsafe(email);
        if (!user) {
            req.res?.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'No user with that email exists.' });
            throw new Error('No user with that email exists.');
        }
        if (!await bcrypt_1.default.compare(password, user.password)) {
            req.res?.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Email and password do not match.' });
            throw new Error('Email and password do not match.');
        }
        return done(null, user); // TODO: Remove private attributes like password
    }
    catch (err) {
        console.error(err, req, req.res);
        return done(err);
    }
}));
exports.authCryptr = new cryptr_1.default(process.env.AUTH_SECRET);
exports.default = passport_1.default;
//# sourceMappingURL=authLoader.js.map