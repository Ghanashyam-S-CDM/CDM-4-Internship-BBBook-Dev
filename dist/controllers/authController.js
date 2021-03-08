"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = exports.cookieDeleteActiveUser = exports.cookieActiveUser = exports.cookieSession = exports.generateRefreshToken = exports.generateAccessToken = exports.rejectToken = exports.validateRefreshToken = exports.serializeClient = exports.serializeUser = exports.signUp = exports.getEmail = exports.register = exports.authenticate = void 0;
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const lodash_1 = __importDefault(require("lodash"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
// import expressJwt from 'express-jwt'
const dotenv_1 = require("dotenv");
dotenv_1.config();
const emailLoader_1 = require("../loaders/emailLoader");
const authLoader_1 = require("../loaders/authLoader");
const ModelLogin = __importStar(require("../models/ModelLogin"));
const ModelUser = __importStar(require("../models/ModelUser"));
const ModelUser_1 = require("../models/ModelUser");
// TODO: isRevoked: isRevokedCallback
// const authenticateInner=expressJwt({
// 	secret: process.env.AUTH_SECRET!,
// 	algorithms: ['HS256'],
// })
// TODO: maybe add token to header
const authenticate = async function (req, res, next) {
    let error;
    try {
        try {
            const user = jsonwebtoken_1.default.verify(req.headers.authorization ? req.headers.authorization.split(' ')[1] : '', process.env.AUTH_SECRET);
            req.user || (req.user = {});
            req.user.id = user.id;
            req.user.clientId = user.clientId;
            next();
        }
        catch (err) {
            error = err;
            console.log(error, req, res);
            if (err.message === 'jwt expired') {
                await exports.validateRefreshToken(req, res, undefined);
                await exports.generateAccessToken(req, res, undefined);
                next();
            }
            else
                throw err;
        }
    }
    catch (err) {
        if (err !== error)
            console.log(error);
        console.error(err, req, res);
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send(error.message);
    }
};
exports.authenticate = authenticate;
const register = async function (req, res, next) {
    try {
        if (!(lodash_1.default.isString(req.body.email) && isEmail_1.default(req.body.email))) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'Email address invalid. Please enter a valid email address.' });
            throw new Error('Email address invalid. Please enter a valid email address.');
        }
        if (await ModelUser.findByEmailUnsafe(req.body.email)) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'User with that email already exists. Please login instead.' });
            throw new Error('User with that email already exists. Please login instead.');
        }
        const emailEncrypted = emailLoader_1.emailCryptr.encrypt(req.body.email);
        await emailLoader_1.sgMail.send({
            to: req.body.email,
            from: process.env.SENDGRID_EMAIL,
            subject: 'Confirm your BBBook registration',
            html: 'Confirm your BBBook registration by clicking https://www.bbbook.ca/#/login-register/' + encodeURI(emailEncrypted),
        });
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
};
exports.register = register;
const getEmail = async function (req, res, next) {
    try {
        try {
            res.email = emailLoader_1.emailCryptr.decrypt(req.body.id);
        }
        catch {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'Link Invalid. Please try signing up again.' });
            throw new Error('Link Invalid. Please try signing up again.');
        }
        if (await ModelUser.findByEmailUnsafe(res.email)) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'User with that email already exists. Please login instead.' });
            throw new Error('User with that email already exists. Please login instead.');
        }
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
};
exports.getEmail = getEmail;
const signUp = async function (req, res, next) {
    try {
        const user = req.body;
        try {
            user.email = emailLoader_1.emailCryptr.decrypt(req.body.email);
        }
        catch {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: 'Email Invalid. Please try signing up again.' });
            throw new Error('Email Invalid. Please try signing up again.');
        }
        const userObj = await ModelUser.addUser(user);
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
};
exports.signUp = signUp;
const serializeUser = function (req, res, next) {
    req.user = lodash_1.default.pick(req.user, ['id']);
    next();
    // db.user.updateOrCreate(req.user,function (err,user){
    // 	if(err) return next(err)
    // 	// we store information needed in token in req.user
    // 	req.user={id: user.id}
    // 	next()
    // })
};
exports.serializeUser = serializeUser;
const serializeClient = async function (req, res, next) {
    try {
        const client = await ModelLogin.addLogin(req.user.id);
        req.user.clientId = client.id;
        req.user.clientExpiry = client.expires_at;
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
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
};
exports.serializeClient = serializeClient;
const validateRefreshToken = async function (req, res, next = undefined) {
    try {
        const userId = req.cookies['bbapi/activeUser'];
        if (!userId) {
            next && res.status(http_status_codes_1.StatusCodes.NO_CONTENT).end();
            throw new Error('No logged in user login found.');
        }
        const token = req.cookies['bbapi/session|' + userId];
        if (!token) {
            next && res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send('Login Invalid. Please try logging in again.');
            throw new Error('Login Invalid. Please try logging in again.');
        }
        let client;
        try {
            client = await ModelLogin.getFromToken(token);
        }
        catch (err) {
            next && res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).send(err.message);
            throw new Error(err.message);
        }
        req.user || (req.user = {});
        req.user.id = client.user_id;
        req.user.clientId = client.id;
        req.user.clientExpiry = client.expires_at;
        next && next();
    }
    catch (err) {
        if (!next)
            throw err;
        else {
            console.error(err, req, res);
            next(err);
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
};
exports.validateRefreshToken = validateRefreshToken;
const rejectToken = async function (req, res, next) {
    try {
        await ModelLogin.deleteToken(req.user.clientId);
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
    }
    // db.client.rejectToken(req.body,next)
};
exports.rejectToken = rejectToken;
const generateAccessToken = function (req, res, next = undefined) {
    try {
        req.token || (req.token = {});
        req.token.accessToken = jsonwebtoken_1.default.sign({
            id: req.user.id,
            clientId: req.user.clientId,
        }, process.env.AUTH_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFETIME });
        next && next();
    }
    catch (err) {
        if (!next)
            throw err;
        else {
            console.error(err, req, res);
            next(err);
        }
    }
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async function (req, res, next) {
    try {
        req.token || (req.token = {});
        req.token.refreshToken = authLoader_1.authCryptr.encrypt(req.user.id + '|' +
            req.user.clientId + '|' +
            (new Date(req.user.clientExpiry)).getTime().toString(16));
        // req.token.refreshToken=`${req.user.clientId} ${req.user.id}`
        await ModelLogin.updateToken(req.user.clientId, req.token.refreshToken);
        next();
    }
    catch (err) {
        console.error(err, req, res);
        next(err);
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
};
exports.generateRefreshToken = generateRefreshToken;
// TODO: Cookie options
const cookieSession = function (req, res, next) {
    res.cookie('bbapi/session|' + req.user.id, req.token.refreshToken, {
        expires: req.user.clientExpiry,
        httpOnly: true,
    });
    next();
};
exports.cookieSession = cookieSession;
const cookieActiveUser = function (req, res, next) {
    res.cookie('bbapi/activeUser', req.user.id, {
        expires: req.user.clientExpiry,
    });
    // TODO: loggedInUsers cookie
    next();
};
exports.cookieActiveUser = cookieActiveUser;
const cookieDeleteActiveUser = function (req, res, next) {
    // res.cookie('bbapi/activeUser',req.user.id,{
    // 	expires: Date.now(),
    // })
    res.clearCookie('bbapi/activeUser');
    res.clearCookie('bbapi/session|' + req.user.id);
    // TODO: loggedInUsers cookie
    next();
};
exports.cookieDeleteActiveUser = cookieDeleteActiveUser;
exports.respond = {
    getEmail: function (req, res) {
        res.status(http_status_codes_1.StatusCodes.OK).send({ data: res.email });
    },
    signUp: function (req, res) {
        res.status(http_status_codes_1.StatusCodes.CREATED).end();
    },
    login: async function (req, res) {
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            data: {
                userId: req.user.id,
                users: await ModelUser_1.getUsers([req.user.id]),
            },
            token: req.token.accessToken,
        });
    },
    logout: function (req, res) {
        res.status(http_status_codes_1.StatusCodes.RESET_CONTENT).end();
    },
};
//# sourceMappingURL=authController.js.map