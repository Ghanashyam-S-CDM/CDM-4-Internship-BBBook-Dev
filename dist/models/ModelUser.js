"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersFromGroups = exports.getUsers = exports.addUser = exports.findByEmailUnsafe = exports.passwordRegex = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbLoader_1 = __importDefault(require("../loaders/dbLoader"));
exports.passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
async function findByEmailUnsafe(email) {
    const [user] = await dbLoader_1.default `
		select id,email,password from users,users_extra
			where email=${email}
			and users.id=users_extra.user_id
	`;
    return user;
}
exports.findByEmailUnsafe = findByEmailUnsafe;
async function addUser(user) {
    if (!exports.passwordRegex.test(user.password))
        throw new Error('Password not secure. Ensure password is between 6 to 20 characters long with least one numeric digit, one uppercase and one lowercase letter');
    user.password = await bcrypt_1.default.hash(user.password, +process.env.SALT_ROUNDS);
    const userObj = await dbLoader_1.default `
		with inserted as (
			insert into users (avatar,bio,birth_date,email,first_name,last_name,username)
				values (
					${user.avatar},
					${user.bio},
					${user.birth_date},
					${user.email},
					${user.first_name},
					${user.last_name},
					${user.username}
				)
				returning id
		)
		insert into users_extra (user_id,password)
			select id,${user.password} from inserted
			returning user_id
	`;
    console.log(userObj);
    return userObj;
}
exports.addUser = addUser;
async function getUsers(user_ids) {
    if (!user_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from users_view
		where id in (${user_ids})
	`;
}
exports.getUsers = getUsers;
async function getUsersFromGroups(group_ids) {
    if (!group_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from users_view
		where id in (
			select distinct user_id
			from group_members
			where group_id in (${group_ids})
		)
	`;
}
exports.getUsersFromGroups = getUsersFromGroups;
//# sourceMappingURL=ModelUser.js.map