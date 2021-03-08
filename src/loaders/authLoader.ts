import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import bcrypt from 'bcrypt'
import Cryptr from 'cryptr'
import {StatusCodes} from 'http-status-codes'
import {config} from 'dotenv'
config()

import * as User from '../models/ModelUser'

// TODO: Check messages
passport.use(new LocalStrategy({
	usernameField: 'email',
	passReqToCallback: true,
},async (req,email,password,done)=>{
	try{
		const user=await User.findByEmailUnsafe(email)
		if(!user){
			req.res?.status(StatusCodes.UNAUTHORIZED).json({message: 'No user with that email exists.'})
			throw new Error('No user with that email exists.')
		}
		if(!await bcrypt.compare(password,user.password)){
			req.res?.status(StatusCodes.UNAUTHORIZED).json({message: 'Email and password do not match.'})
			throw new Error('Email and password do not match.')
		}
		return done(null,user) // TODO: Remove private attributes like password
	}catch(err){
		console.error(err,req,req.res)
		return done(err)
	}
}))

export const authCryptr=new Cryptr(process.env.AUTH_SECRET!)

export default passport