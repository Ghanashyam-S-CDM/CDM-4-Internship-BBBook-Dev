import {RequestHandler} from 'express'
import isEmail from 'validator/lib/isEmail'
import _ from 'lodash'
import jwt from 'jsonwebtoken'
import {StatusCodes} from 'http-status-codes'
// import expressJwt from 'express-jwt'
import {config} from 'dotenv'
config()

import {emailCryptr,sgMail} from '../loaders/emailLoader'
import {authCryptr} from '../loaders/authLoader'
import * as ModelLogin from '../models/ModelLogin'
import * as ModelUser from '../models/ModelUser'
import {getUsers} from '../models/ModelUser'

// TODO: isRevoked: isRevokedCallback
// const authenticateInner=expressJwt({
// 	secret: process.env.AUTH_SECRET!,
// 	algorithms: ['HS256'],
// })

// TODO: maybe add token to header
export const authenticate:RequestHandler=async function (req,res,next){
	let error
	try{
		try{
			const user=jwt.verify(
				req.headers.authorization?req.headers.authorization.split(' ')[1]:'',
				process.env.AUTH_SECRET,
			)
			req.user||={}
			req.user.id=user.id
			req.user.clientId=user.clientId
			next()
		}catch(err){
			error=err
			console.log(error,req,res)
			if(err.message==='jwt expired'){
				await validateRefreshToken(req,res,undefined!)
				await generateAccessToken(req,res,undefined!)
				next()
			}else throw err
		}
	}catch(err){
		if(err!==error) console.log(error)
		console.error(err,req,res)
		res.status(StatusCodes.UNAUTHORIZED).send(error.message)
	}
}

export const register:RequestHandler=async function (req,res,next){
	try{
		if(!(_.isString(req.body.email) && isEmail(req.body.email))){
			res.status(StatusCodes.BAD_REQUEST).json({message: 'Email address invalid. Please enter a valid email address.'})
			throw new Error('Email address invalid. Please enter a valid email address.')
		}
		if(await ModelUser.findByEmailUnsafe(req.body.email)){
			res.status(StatusCodes.BAD_REQUEST).json({message: 'User with that email already exists. Please login instead.'})
			throw new Error('User with that email already exists. Please login instead.')
		}
		const emailEncrypted=emailCryptr.encrypt(req.body.email)
		await sgMail.send({
			to: req.body.email!,
			from: process.env.SENDGRID_EMAIL!,
			subject: 'Confirm your BBBook registration',
			html: 'Confirm your BBBook registration by clicking https://www.bbbook.ca/#/login-register/'+encodeURI(emailEncrypted), // TODO
		})
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}
}

export const getEmail:RequestHandler=async function (req,res,next){
	try{
		try{ res.email=emailCryptr.decrypt(req.body.id) }catch{
			res.status(StatusCodes.BAD_REQUEST).json({message: 'Link Invalid. Please try signing up again.'})
			throw new Error('Link Invalid. Please try signing up again.')
		}
		if(await ModelUser.findByEmailUnsafe(res.email)){
			res.status(StatusCodes.BAD_REQUEST).json({message: 'User with that email already exists. Please login instead.'})
			throw new Error('User with that email already exists. Please login instead.')
		}
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}
}

export const signUp:RequestHandler=async function (req,res,next){
	try{
		const user=req.body
		try{ user.email=emailCryptr.decrypt(req.body.email) }catch{
			res.status(StatusCodes.BAD_REQUEST).json({message: 'Email Invalid. Please try signing up again.'})
			throw new Error('Email Invalid. Please try signing up again.')
		}
		const userObj=await ModelUser.addUser(user)
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}
}

export const serializeUser:RequestHandler=function (req,res,next){
	req.user=_.pick(req.user,['id'])
	next()

	// db.user.updateOrCreate(req.user,function (err,user){
	// 	if(err) return next(err)
	// 	// we store information needed in token in req.user
	// 	req.user={id: user.id}
	// 	next()
	// })
}

export const serializeClient:RequestHandler=async function (req,res,next){
	try{
		const client=await ModelLogin.addLogin(req.user.id)
		req.user.clientId=client.id
		req.user.clientExpiry=client.expires_at
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}

	// db.client.updateOrCreate(
	// 	{user: req.user},
	// 	function (err,client){
	// 		if(err) return next(err)
	// 		// we store information needed in token in req.user
	// 		req.user.clientId=client.id
	// 		next()
	// 	}
	// )
}

export const validateRefreshToken:RequestHandler=async function (req,res,next=undefined){
	try{
		const userId=req.cookies['bbapi/activeUser']
		if(!userId){
			next && res.status(StatusCodes.NO_CONTENT).end()
			throw new Error('No logged in user login found.')
		}
		const token=req.cookies['bbapi/session|'+userId]
		if(!token){
			next && res.status(StatusCodes.UNAUTHORIZED).send('Login Invalid. Please try logging in again.')
			throw new Error('Login Invalid. Please try logging in again.')
		}
		let client
		try{ client=await ModelLogin.getFromToken(token) }
		catch(err){
			next && res.status(StatusCodes.UNAUTHORIZED).send(err.message)
			throw new Error(err.message)
		}
		req.user||={}
		req.user.id=client.user_id
		req.user.clientId=client.id
		req.user.clientExpiry=client.expires_at
		next && next()
	}catch(err){
		if(!next) throw err
		else{
			console.error(err,req,res)
			next(err)
		}
		// res.status(StatusCodes.UNAUTHORIZED).json({message: err.message})
	}

	// db.client.findUserOfToken(
	// 	req.body,
	// 	function (err,user){
	// 		if(err) return next(err)
	// 		req.user=user
	// 		next()
	// 	}
	// )
}

export const rejectToken:RequestHandler=async function (req,res,next){
	try{
		await ModelLogin.deleteToken(req.user.clientId)
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}
	// db.client.rejectToken(req.body,next)
}

export const generateAccessToken:RequestHandler=function (req,res,next=undefined){
	try{
		req.token||={}
		req.token.accessToken=jwt.sign(
			{
				id: req.user.id,
				clientId: req.user.clientId,
			},
			process.env.AUTH_SECRET!,
			{expiresIn: process.env.ACCESS_TOKEN_LIFETIME!},
		)
		next && next()
	}catch(err){
		if(!next) throw err
		else{
			console.error(err,req,res)
			next(err)
		}
	}
}

export const generateRefreshToken:RequestHandler=async function (req,res,next){
	try{
		req.token||={}
		req.token.refreshToken=authCryptr.encrypt(
			req.user.id+'|'+
			req.user.clientId+'|'+
			(new Date(req.user.clientExpiry)).getTime().toString(16)
		)
		// req.token.refreshToken=`${req.user.clientId} ${req.user.id}`
		await ModelLogin.updateToken(req.user.clientId,req.token.refreshToken)
		next()
	}catch(err){
		console.error(err,req,res)
		next(err)
	}

	// req.token||={}
	// req.token.refreshToken=req.user.clientId+'.'+crypto.randomBytes(40).toString('hex')
	// db.client.storeToken(
	// 	{
	// 		id: req.user.clientId,
	// 		refreshToken: req.token.refreshToken,
	// 	},
	// 	next,
	// )
}

// TODO: Cookie options

export const cookieSession:RequestHandler=function (req,res,next){
	res.cookie('bbapi/session|'+req.user.id,req.token.refreshToken,{
		expires: req.user.clientExpiry,
		httpOnly: true,
	})
	next()
}

export const cookieActiveUser:RequestHandler=function (req,res,next){
	res.cookie('bbapi/activeUser',req.user.id,{
		expires: req.user.clientExpiry,
	})
	// TODO: loggedInUsers cookie
	next()
}

export const cookieDeleteActiveUser:RequestHandler=function (req,res,next){
	// res.cookie('bbapi/activeUser',req.user.id,{
	// 	expires: Date.now(),
	// })
	res.clearCookie('bbapi/activeUser')
	res.clearCookie('bbapi/session|'+req.user.id)
	// TODO: loggedInUsers cookie
	next()
}

export const respond={
	getEmail: function (req,res){
		res.status(StatusCodes.OK).send({data: res.email})
	},
	signUp: function (req,res){
		res.status(StatusCodes.CREATED).end()
	},
	login: async function (req,res){
		res.status(StatusCodes.CREATED).json({
			data: {
				userId: req.user.id,
				users: await getUsers([req.user.id]),
			},
			token: req.token.accessToken,
		})
	},
	logout: function (req,res){
		res.status(StatusCodes.RESET_CONTENT).end()
	},
}