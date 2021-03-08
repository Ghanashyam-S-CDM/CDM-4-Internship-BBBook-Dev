import sql from '../loaders/dbLoader'

export async function cleanLogins(sql){
	console.log('Deleting expired logins')
	console.log(await sql`
		delete from logins
			where expires_at<=current_timestamp
			returning *
	`)
}

// TODO: Check performance of query
export async function addLogin(user_id:String){
	const start=Date.now()
	const tokenLifetime=process.env.REFRESH_TOKEN_LIFETIME
	const [client]=await sql`
		insert into logins(user_id,expires_at)
			values (${user_id},current_timestamp + '${sql(tokenLifetime)}')
			returning *
	`
	console.log(client)
	console.log((Date.now()-start)/1000)
	return client
}

export async function updateToken(client_id:String,token:String){
	console.log(await sql`
		update logins set token=${token}
			where id=${client_id}
			returning *
	`)
}

export async function getFromToken(token:String){
	const [login]=await sql`
		select * from logins
			where token=${token}
	`
	if(!login) throw new Error('User login invalid. Please try logging in again.')
	if((new Date())>(new Date(login.expires_at))){
		console.log(await sql`
			delete from logins
				where token=${token}
		`)
		throw new Error('User login expired. Please try logging in again.')
	}else return login
}

export async function deleteToken(client_id:String){
	console.log(await sql`
		delete from logins
			where id=${client_id}
			returning *
	`)
}