"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteToken = exports.getFromToken = exports.updateToken = exports.addLogin = exports.cleanLogins = void 0;
const dbLoader_1 = __importDefault(require("../loaders/dbLoader"));
async function cleanLogins(sql) {
    console.log('Deleting expired logins');
    console.log(await sql `
		delete from logins
			where expires_at<=current_timestamp
			returning *
	`);
}
exports.cleanLogins = cleanLogins;
// TODO: Check performance of query
async function addLogin(user_id) {
    const start = Date.now();
    const tokenLifetime = process.env.REFRESH_TOKEN_LIFETIME;
    const [client] = await dbLoader_1.default `
		insert into logins(user_id,expires_at)
			values (${user_id},current_timestamp + '${dbLoader_1.default(tokenLifetime)}')
			returning *
	`;
    console.log(client);
    console.log((Date.now() - start) / 1000);
    return client;
}
exports.addLogin = addLogin;
async function updateToken(client_id, token) {
    console.log(await dbLoader_1.default `
		update logins set token=${token}
			where id=${client_id}
			returning *
	`);
}
exports.updateToken = updateToken;
async function getFromToken(token) {
    const [login] = await dbLoader_1.default `
		select * from logins
			where token=${token}
	`;
    if (!login)
        throw new Error('User login invalid. Please try logging in again.');
    if ((new Date()) > (new Date(login.expires_at))) {
        console.log(await dbLoader_1.default `
			delete from logins
				where token=${token}
		`);
        throw new Error('User login expired. Please try logging in again.');
    }
    else
        return login;
}
exports.getFromToken = getFromToken;
async function deleteToken(client_id) {
    console.log(await dbLoader_1.default `
		delete from logins
			where id=${client_id}
			returning *
	`);
}
exports.deleteToken = deleteToken;
//# sourceMappingURL=ModelLogin.js.map