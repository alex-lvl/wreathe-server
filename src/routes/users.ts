import type { NextFunction, Request, Response, Router } from 'express'
import express from 'express'
import { authenticateToken } from '../middlewares/authenticate-token'
import jwt = require('jsonwebtoken')
import { User } from '../utils/types'
const router: Router = express.Router()

// interface userRequest extends Request {
//   user: any
// }

/* GET users listing. */
router.get('/', function (req: Request, res: Response) {
  res.send('respond with a resource hello world')
})

// router.post('/', function (req: Request, res: Response, next: NextFunction) {
//   // Authenticate the user
//   interface User {
//     id: number
//     username: string
//   }
//   const user: User = {
//     id: 123,
//     username: 'example_user1',
//   }

//   // Generate a JWT
//   jwt.sign(
//     user,
//     process.env.JWT_KEY,
//     { expiresIn: 30 },
//     (err: JsonWebTokenError, token: string) => {
//       if (err) {
//         res.status(500).json({ error: 'Failed to generate token' })
//       } else {
//         res.json({ token })
//       }
//     },
//   )
// })

// function authenticateToken(req: any, res: Response, next: NextFunction) {
//   const token = req.headers.authorization

//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' })
//   }
//   const bearer = token.split(' ')
//   const bearerToken = bearer[1]
//   req.token = bearerToken
//   return next()
// }

router.get(
  '/protected',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user
      console.log(user, '\n req user')
      if (!user) {
        res.status(401).json('protected route')
      }
    } catch (err) {
      return next(err)
    }
    res.json({ message: 'protected route accessed successfully' })
    // Access the authenticated user via req.user
  },
)

router.post(
  '/refresh-token',
  (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshtoken

    // If we don't have a token in our request
    if (!refreshToken) {
      return res.status(401).json({ error: 'no refresh token provided!' })
    }
    // We have a token, let's verify it!
    const secret: string = process.env.JWT_KEY as string
    let userId: { id: string } = { id: '' }
    jwt.verify(refreshToken, secret, {}, (err, decoded: any) => {
      if (err || !decoded) {
        return res
          .status(403)
          .json({ error: 'Failed to authenticate refresh token' })
      } else {
        userId = decoded
        console.log(
          decoded,
          'decoded user should be set to user. just set the user variable declaration to the jwt verify function and return decoded from the function',
        )
      }
    })

    //FAKE USER ONLY
    const user: User = {
      id: userId.id,
      firstName: 'first',
      lastName: 'last',
      email: 'email@email.com',
      password: 'password',
      refreshToken: null!,
    }
    // token is valid, check if user exist
    // const user = fakeDB.find(user => user.id === payload.userId);
    // if (!user) {
    //   return res.status(401).json({ error: 'User does not exist' })
    // }
    // // user exist, check if refreshtoken exist on user
    // if (user.refreshToken !== refreshToken) {
    //   return res
    //     .status(401)
    //     .json({ error: 'The user does not have a refresh token!' })
    // }
    try {
      const payload: { id: string } = { id: user.id }
      // token exist, create new Refresh- and accesstoken
      const newAccessToken = jwt.sign(payload, secret, { expiresIn: '2m' })
      const newRefreshToken = jwt.sign(payload, secret, { expiresIn: '30m' })
      // update refreshtoken on user in db
      // Could have different versions instead!
      user.refreshToken = newRefreshToken

      // All good to go, send new refreshtoken and accesstoken
      res.cookie('refreshToken', newRefreshToken, {
        // httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      })
      return res.json({ newAccessToken })
    } catch (err) {
      return next(err)
    }
  },
)

export default router
