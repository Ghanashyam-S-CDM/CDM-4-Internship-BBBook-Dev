import cors,{CorsOptions} from 'cors'
import {config} from 'dotenv'
config()
export const isDevelopment=(process.env.NODE_ENV==='development')

let whiteList:Array<string>=[
	'https://bbbook.ca',
	'https://www.bbbook.ca',
]

isDevelopment && (whiteList=[
	...whiteList,
	// Dev whitelist goes here
	'http://localhost:12541',
])
console.log(whiteList)

const corsOptions:CorsOptions={
	origin: whiteList,
	credentials: true,
}

export default cors(corsOptions)