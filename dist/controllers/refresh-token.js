"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenPost = void 0;
const jwt = require("jsonwebtoken");
// import {
//   setAccessToken,
//   setRefreshToken,
//   setUserData,
// } from '../utils/cookie-setter'
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const secretKey = process.env.JWT_KEY;
// const encodedKey = new TextEncoder().encode(secret);
const refreshTokenPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.cookies)
    // const accessToken = req.cookies.accessToken
    // const refreshToken = req.cookies.refreshToken
    // const userData = req.cookies.userData
    // // If we don't have a token in our request
    // if (!refreshToken) {
    //   res.clearCookie('userData', { path: '/' })
    //   console.error('NO REFRESH TOKEN PROVIDED! SIGN IN OR REGISTER NEEDED:')
    //   return res
    //     .status(401)
    //     .json({
    //       error: 'no refresh token provided! Sign in.',
    //       success: false,
    //       accessToken: null,
    //     })
    // }
    // if (accessToken) {
    //   console.log('ACCESS TOKEN STILL EXISTS!')
    //   return res.json({
    //     accessToken,
    //     userData,
    //     success: true,
    //     message: 'ACCESS TOKEN STILL EXISTS',
    //   })
    // }
    try {
        if (!req.headers.authorization) {
            console.error('NO HEADERS SET');
            return res.status(401).json({
                error: 'no refresh token provided! Sign in.',
                success: false,
                accessToken: null,
            });
        }
        const refreshToken = req.headers.authorization.split(' ')[1];
        // We have a token, let's verify it!
        const decoded = jwt.verify(refreshToken, secretKey);
        const userId = decoded.id;
        // token is valid, check if user exist
        const user = yield prisma.wreathe_user.findUnique({
            where: { user_uid: userId },
        });
        if (!user) {
            console.error('USER DOES NOT EXIST! ERROR FINDING USER IN DB');
            return res.status(401).json({
                error: 'User does not exist',
                success: false,
                accessToken: null,
            });
        }
        // user exist, check if refreshtoken exist on user
        if (user.refresh_token !== refreshToken) {
            console.error('NO REFRESH TOKEN FOUND ON USER! OR REFRESH TOKEN DOES NOT MATCH BROWSER REFRESH TOKEN WITH USERS REFRESH TOKEN!');
            return res.status(401).json({
                error: 'The user does not have a refresh token!',
                success: false,
                accessToken: null,
            });
        }
        // token exist, create new Refresh- and accesstoken
        const payload = { id: user.user_uid, username: user.username };
        const newAccessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign(payload, secretKey, { expiresIn: '1d' });
        // update refreshtoken on user in db
        // Could have different versions instead!
        yield prisma.wreathe_user.update({
            where: { user_uid: user.user_uid },
            data: { refresh_token: newRefreshToken },
        });
        const userData = {
            user_uid: user.user_uid,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username,
        };
        // setAccessToken(res, 'accessToken', newAccessToken, 60 * 60 * 1000)
        // setRefreshToken(res, 'refreshToken', newRefreshToken, 24 * 60 * 60 * 1000)
        // setUserData(res, 'userData', JSON.stringify(userData), 24 * 60 * 60 * 1000)
        return res.json({
            success: true,
            message: 'Refreshed token successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            userData,
        });
    }
    catch (err) {
        console.error('THERE WAS AN ISSUE REFRESHING THE TOKEN\n', err);
        return res.status(403).json({
            err,
            success: false,
            message: 'THERE WAS AN ISSUE REFRESHING THE TOKEN.',
            error: `THERE WAS AN ISSUE REFRESHING THE TOKEN: ${err}`,
            accessToken: null,
        });
    }
});
exports.refreshTokenPost = refreshTokenPost;
// res.cookie('accessToken', newAccessToken, {
//   // httpOnly: true,
//   secure: false,
//   sameSite: 'none',
//   maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
//   path: '/users/refresh-token',
// })
// // All good to go, send new refreshtoken and accesstoken
// res.cookie('refreshToken', newRefreshToken, {
//   // httpOnly: true,
//   secure: false,
//   sameSite: 'none',
//   maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
//   path: '/users/refresh-token',
// })
// const bearerToken = req.headers.authorization!
// const refreshToken = bearerToken.split(' ')[1]
// const user = fakeDB.find(user => user.id === payload.userId);
// jwt.verify(refreshToken, secret, {}, (err, decoded: any) => {
//   if (err || !decoded) {
//     return res
//       .status(403)
//       .json({ error: 'Failed to authenticate refresh token' })
//   } else {
//     userId = decoded
//     console.log(
//       decoded,
//       'decoded user should be set to user. just set the user variable declaration to the jwt verify function and return decoded from the function',
//     )
//   }
// })
//FAKE USER ONLY
// const user: User = {
//   id: userId,
//   firstName: 'first',
//   lastName: 'last',
//   email: 'email@email.com',
//   password: 'password',
//   refreshToken: null!,
// }
// console.log(user.refresh_token, '\n=============')
// console.log(refreshToken, '\n=================')
// user.refreshToken = newRefreshToken
