import sql from '../loaders/dbLoader'
import {getUsersFromGroups} from './ModelUser'
import {getBooksFromGroups} from './ModelBook'

export async function groupsToFull(groups){
	if(!groups.length) return {}
	const group_ids=groups.map(g=>g.id)
	const [users,books]=await Promise.all([
		getUsersFromGroups(group_ids),
		getBooksFromGroups(group_ids),
	])
	return {groups,users,books}
}

export async function getGroupsFromUsers(user_ids){
	if(!user_ids.length) return []
	return await sql`
		select *
		from groups_view
		where id in (
			select distinct group_id
			from group_members
			where user_id in (${user_ids})
		)
	`
}

export async function getGroups(group_ids){
	if(!group_ids.length) return []
	return await sql`
		select *
		from groups_view
		where id in (${group_ids})
	`
}

export async function addGroup(data){
	return await sql`
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
	`
}

export async function editGroup(data){
	await Promise.all([
		sql`
			update groups set (title,avatar,bio,group_type) = (
				${data.title},
				${data.avatar},
				${data.bio},
				${data.group_type}
			)
			where id=${data.id}
			returning id
		`,
		sql`
			with
			deleted as(
				delete from group_members
				where group_id=${data.id}
				returning group_id
			),
			inserted as(
				insert into group_members
				${sql(data.group_members,'user_id','group_id','member_type')}
				returning group_id
			)
			select * from deleted
			union
			select * from inserted
		`, // Multiple delete then insert
	])
	return data.id
}

export async function addGroupMember(data){
	return await sql`
		insert into group_members (user_id,group_id,member_type)
		values (
			${data.user_id},
			${data.group_id},
			'member'
		)
	`
}

export async function archiveGroup(data){
	console.log(data,`
		update groups set (is_archived) = (${data.value})
		where id=${data.id}
		returning id
	`)
	return await sql`
		update groups set (is_archived) = (${data.value})
		where id=${data.id}
		returning id
	`
}