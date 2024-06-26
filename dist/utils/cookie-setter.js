"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserData = exports.setAccessToken = exports.setRefreshToken = void 0;
const setRefreshToken = (res, name, token, maxAge) => {
    if (process.env.NODE_ENV !== 'production') {
        const options = {
            // httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge,
            path: '/logout',
        };
        return res.cookie(name, token, options);
    }
    else if (process.env.NODE_ENV === 'production') {
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge,
            path: '/logout',
        };
        return res.cookie(name, token, options);
    }
};
exports.setRefreshToken = setRefreshToken;
const setAccessToken = (res, name, token, maxAge) => {
    if (process.env.NODE_ENV !== 'production') {
        const options = {
            // httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge,
            path: '/',
        };
        return res.cookie(name, token, options);
    }
    else if (process.env.NODE_ENV === 'production') {
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge,
            path: '/',
        };
        return res.cookie(name, token, options);
    }
};
exports.setAccessToken = setAccessToken;
const setUserData = (res, name, userData, maxAge) => {
    if (process.env.NODE_ENV !== 'production') {
        const options = {
            // httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge,
            path: '/',
        };
        return res.cookie(name, userData, options);
    }
    else if (process.env.NODE_ENV === 'production') {
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge,
            path: '/',
        };
        return res.cookie(name, userData, options);
    }
};
exports.setUserData = setUserData;
