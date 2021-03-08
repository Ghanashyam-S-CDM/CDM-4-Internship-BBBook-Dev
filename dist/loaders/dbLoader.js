"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
const ModelLogin_1 = require("../models/ModelLogin");
console.log('Connecting to DB');
const sql = postgres_1.default(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: process.env.DB_CONNECTIONS_MAX,
});
function periodicJobs() {
    ModelLogin_1.cleanLogins(sql);
}
periodicJobs();
global.setInterval(periodicJobs, +process.env.DB_CONNECTION_REFRESH_INTERVAL_MILLISEC);
exports.default = sql;
//# sourceMappingURL=dbLoader.js.map