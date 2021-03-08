import {Router} from 'express'

import {
	register,
	getEmail,
	signUp,
	serializeUser,
	serializeClient,
	validateRefreshToken,
	rejectToken,
	generateAccessToken,
	generateRefreshToken,
	cookieSession,
	cookieActiveUser,
	cookieDeleteActiveUser,
	respond,
} from '../controllers/authController'
import passport from '../loaders/authLoader'

const authRouter=Router()

authRouter.post('/api/register',
	register,
	respond.signUp,
)
authRouter.post('/api/get-email',
	getEmail,
	respond.getEmail,
)
authRouter.post('/api/sign-up',
	signUp,
	// TODO: Consider logging in here
	respond.signUp,
)
authRouter.post('/api/login',
	passport.authenticate('local',{session: false}),
	serializeUser,
	serializeClient,
	generateAccessToken,
	generateRefreshToken,
	cookieSession,
	cookieActiveUser,
	respond.login,
)
authRouter.post('/api/refresh',
	validateRefreshToken,
	generateAccessToken,
	cookieActiveUser,
	respond.login,
)
authRouter.post('/api/logout',
	validateRefreshToken,
	rejectToken,
	cookieDeleteActiveUser,
	respond.logout
)

export default authRouter