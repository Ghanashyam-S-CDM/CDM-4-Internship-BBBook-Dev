import {RequestHandler} from 'express'

// Request logger middleware
const logger:RequestHandler=(req,res,next)=>{
	console.log(req.method,req.url,req)
	next()
}

export default logger