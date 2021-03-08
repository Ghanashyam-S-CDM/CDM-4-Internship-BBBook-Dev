import bcrypt from 'bcrypt'

import sql from '../loaders/dbLoader'

export const passwordRegex=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

export async function findByEmailUnsafe(email:String){
	const [user]=await sql`
		select id,email,password from users,users_extra
			where email=${email}
			and users.id=users_extra.user_id
	`
	return user
}

export async function addUser(user){
	if(!passwordRegex.test(user.password))
		throw new Error('Password not secure. Ensure password is between 6 to 20 characters long with least one numeric digit, one uppercase and one lowercase letter')
	user.password=await bcrypt.hash(user.password,+process.env.SALT_ROUNDS!)
	const userObj=await sql`
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
	`
	console.log(userObj)
	return userObj
}

export async function getUsers(user_ids){
	if(!user_ids.length) return []
	return await sql`
		select *
		from users_view
		where id in (${user_ids})
	`
}

export async function getUsersFromGroups(group_ids){
	if(!group_ids.length) return []
	return await sql`
		select *
		from users_view
		where id in (
			select distinct user_id
			from group_members
			where group_id in (${group_ids})
		)
	`
}