import type { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
// import { User } from '../../types'
import jwt = require('jsonwebtoken')
import 'dotenv/config'
import { User } from '../../utils/types'

export const loginGet = (req: Request, res: Response) => {
  res.cookie('cookie set', 'this')
  res.send('login page')
}

export const loginPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password }: { email: string; password: string } = req.body
    if (!(email && password)) {
      return res.status(400).json({ message: 'MISSING CREDENTIALS' })
    }
    // Authenticate the user by fetching user from DB by username(email)

    //FAKE USER ONLY MAKE SURE TO DELETE
    const encryptedPassword = await bcrypt.hash('password', 10)
    const user: User = {
      id: '123',
      firstName: 'first',
      lastName: 'last',
      email: email,
      password: encryptedPassword,
      refreshToken: null!,
    }

    if (!user) {
      return res.status(401).json({ error: 'USER DOES NOT EXIST!' })
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'PASSWORD DOES NOT MATCH' })
    }

    const secret: string = process.env.JWT_KEY as string
    const payload: { id: string } = { id: user.id }
    const accessToken = jwt.sign(payload, secret, { expiresIn: '5m' })
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '30m' })

    //add refreshToken to user and store in DB?
    user.refreshToken = refreshToken
    //save to db

    // Set refresh token as a secure HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      // httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/refresh-token',
    })

    // Send the access token in the response
    return res.json({ accessToken })
  } catch (err) {
    return next(err)
  }
}
