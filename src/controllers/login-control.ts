import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt = require('jsonwebtoken')
import 'dotenv/config'
import { LoginCredentials } from '../utils/types'
import { setAccessToken, setRefreshToken } from '../utils/cookie-setter'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const loginGet = (req: Request, res: Response) => {
  res.send('login page')
}

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginCredentials = req.body
    if (!(username && password)) {
      return res.status(400).json({ message: 'MISSING CREDENTIALS' })
    }

    // Authenticate the user by fetching user from DB by username(username)
    const user = await prisma.wreathe_user.findUnique({
      where: {
        username,
      },
    })
    if (!user) {
      return res.status(401).json({ error: 'USER DOES NOT EXIST!' })
    }
    const passwordMatch = await bcrypt.compare(password, user.user_password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'PASSWORD DOES NOT MATCH' })
    }

    //Refresh token
    const secret: string = process.env.JWT_KEY as string
    const payload = { id: user.user_uid, username: user.username }
    const accessToken = jwt.sign(payload, secret, { expiresIn: '1h' })
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '1d' })

    //add refreshToken to user and store in DB?
    await prisma.wreathe_user.update({
      where: { user_uid: user.user_uid },
      data: { refresh_token: refreshToken },
    })

    setAccessToken(res, 'accessToken', accessToken, 60 * 60 * 1000)
    setRefreshToken(res, 'refreshToken', refreshToken, 24 * 60 * 60 * 1000)

    // Send the access token in the response
    return res.json({ accessToken, userId: user.user_uid })
  } catch (err) {
    return res
      .status(403)
      .json({ err, message: 'There was an issue logging in' })
  }
}

//FAKE USER ONLY MAKE SURE TO DELETE
// const encryptedPassword = await bcrypt.hash('password', 10)
// const user: User = {
//   id: '123',
//   firstName: 'first',
//   lastName: 'last',
//   email: email,
//   password: encryptedPassword,
//   refreshToken: null!,
// }

// user.refreshToken = refreshToken
