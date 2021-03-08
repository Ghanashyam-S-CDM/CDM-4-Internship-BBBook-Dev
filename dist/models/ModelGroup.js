"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveGroup = exports.addGroupMember = exports.editGroup = exports.addGroup = exports.getGroups = exports.getGroupsFromUsers = exports.groupsToFull = void 0;
const dbLoader_1 = __importDefault(require("../loaders/dbLoader"));
const ModelUser_1 = require("./ModelUser");
const ModelBook_1 = require("./ModelBook");
async function groupsToFull(groups) {
    if (!groups.length)
        return {};
    const group_ids = groups.map(g => g.id);
    const [users, books] = await Promise.all([
        ModelUser_1.getUsersFromGroups(group_ids),
        ModelBook_1.getBooksFromGroups(group_ids),
    ]);
    return { groups, users, books };
}
exports.groupsToFull = groupsToFull;
async function getGroupsFromUsers(user_ids) {
    if (!user_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from groups_view
		where id in (
			select distinct group_id
			from group_members
			where user_id in (${user_ids})
		)
	`;
}
exports.getGroupsFromUsers = getGroupsFromUsers;
async function getGroups(group_ids) {
    if (!group_ids.length)
        return [];
    return await dbLoader_1.default `
		select *
		from groups_view
		where id in (${group_ids})
	`;
}
exports.getGroups = getGroups;
async function addGroup(data) {
    return await dbLoader_1.default `
		with inserted as (
			insert into groups (title,avatar,bio,group_type)
			values (
				${data.title},
				${data.avatar},
				${data.bio},
				${data.group_type}
			)
			returning id
		)
		insert into group_members (user_id,group_id,member_type)
		select 
			${data.group_members[0].user_id},
			inserted.id,
			${data.group_members[0].member_type}
		from inserted
		returning group_id	
	`;
}
exports.addGroup = addGroup;
async function editGroup(data) {
    await Promise.all([
        dbLoader_1.default `
			update groups set (title,avatar,bio,group_type) = (
				${data.title},
				${data.avatar},
				${data.bio},
				${data.group_type}
			)
			where id=${data.id}
			returning id
		`,
        dbLoader_1.default `
			with
			deleted as(
				delete from group_members
				where group_id=${data.id}
				returning group_id
			),
			inserted as(
				insert into group_members
				${dbLoader_1.default(data.group_members, 'user_id', 'group_id', 'member_type')}
				returning group_id
			)
			select * from deleted
			union
			select * from inserted
		`,
    ]);
    return data.id;
}
exports.editGroup = editGroup;
async function addGroupMember(data) {
    return await dbLoader_1.default `
		insert into group_members (user_id,group_id,member_type)
		values (
			${data.user_id},
			${data.group_id},
			'member'
		)
	`;
}
exports.addGroupMember = addGroupMember;
async function archiveGroup(data) {
    console.log(data, `
		update groups set (is_archived) = (${data.value})
		where id=${data.id}
		returning id
	`);
    return await dbLoader_1.default `
		update groups set (is_archived) = (${data.value})
		where id=${data.id}
		returning id
	`;
}
exports.archiveGroup = archiveGroup;
//# sourceMappingURL=ModelGroup.js.map