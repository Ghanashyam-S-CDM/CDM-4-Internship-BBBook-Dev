import {RequestHandler} from 'express'

// HTTP to HTTPS redirect middleware
const httpsRedirect:RequestHandler=(req,res,next)=>
	req.secure?next():res.redirect('https://'+req.headers.host+req.url)

export default httpsRedirect