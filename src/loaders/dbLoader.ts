import postgres from 'postgres'
import {config} from 'dotenv'
config()

import {cleanLogins} from '../models/ModelLogin'

console.log('Connecting to DB')
const sql=postgres(
	process.env.DATABASE_URL,
	{
		ssl: {rejectUnauthorized: false}, // TODO: Check
		max: process.env.DB_CONNECTIONS_MAX,
	},
)
function periodicJobs(){
	cleanLogins(sql)
}
periodicJobs()
global.setInterval(periodicJobs,+process.env.DB_CONNECTION_REFRESH_INTERVAL_MILLISEC)

export default sql