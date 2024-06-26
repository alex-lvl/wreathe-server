import type { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
// import cloudinary from '../../utils/cloudinary'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const commentsGet = async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { ispublished: true },
      orderBy: { comment_timestamp: 'desc' },
    })
    return res.json({
      success: true,
      message: 'SUCCESSFULLY FETCHED COMMENTS',
      comments,
    })
  } catch (err) {
    res.status(403).json({
      err,
      success: false,
      message: 'there was an issue fetching comments',
    })
  }
}

export const commentsPost = [
  body('content', 'Content is required').trim().isLength({ min: 1 }),
  // body('isPublished', 'boolean value needed').isBoolean(),
  param('threadid', 'missing thread id parameter').isUUID(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    const commentData = {
      content: req.body.content,
      // ispublished: req.body.isPublished,
      ispublished: true,
      //change the method to grab useruid usually was req.user.:id
      author_ref: req.user.id,
      thread_ref: req.params.threadid,
    }
    if (!errors.isEmpty()) {
      console.error('VALIDATION FAILURE:', errors.array())
      return res.json({ commentData, errors: errors.array() })
    }
    try {
      const comment = await prisma.comment.create({
        data: commentData,
      })
      const commentField = await prisma.thread.update({
        where: { thread_uid: req.params.threadid },
        data: {
          comment: {
            connect: { comment_uid: comment.comment_uid },
          },
        },
      })
      console.log(commentField, '\ncomment field')
      const threadURL = `users/${req.user.id}/threads/${comment.thread_ref}`
      const commentURL = `users/${req.user.id}/threads/${comment.thread_ref}/comments/${comment.comment_uid}`
      return res.json({
        success: true,
        message: 'SUCCESSFULLY SUBMITTED COMMENT',
        comment,
        commentURL,
        threadURL,
      })
    } catch (err) {
      console.error('THERE WAS AN ISSUE CREATING A NEW COMMENT', err)
      return res.status(403).json({
        err,
        success: false,
        message: 'there was an issue creating a new comment',
      })
    }
  },
]

export const commentsPut = [
  body('content', 'Content is required').trim().isLength({ min: 1 }),
  body('isPublished', 'boolean value needed').isBoolean(),
  param('threadid', 'missing thread id parameter').notEmpty().isUUID(),
  param('commentid', 'missing comment id parameter').notEmpty().isUUID(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    const commentData = {
      comment_uid: req.params.commentid,
      content: req.body.content,
      ispublished: req.body.isPublished,
      thread_ref: req.params.threadid,
      //change the method to grab useruid usually was req.user.:id
      author_ref: req.body.userUid,
    }
    if (!errors.isEmpty()) {
      return res.json({ commentData, errors: errors.array() })
    }
    try {
      const comment = await prisma.comment.update({
        where: { comment_uid: req.params.commentid },
        data: commentData,
      })
      const commentURL = `/threads/${comment.thread_ref}/comments/${comment.comment_uid}`
      return res.json({
        success: true,
        message: 'SUCCESSFULLY UPDATED COMMENT',
        comment,
        commentURL,
      })
    } catch (err) {
      return res.status(403).json({
        err,
        success: false,
        message: 'there was an issue creating a new comment',
      })
    }
  },
]

export const commentsDelete = async (req: Request, res: Response) => {
  try {
    // const comment = await prisma.comment.findUniqueOrThrow({
    //   where: { comment_uid: req.params.commentid },
    // })
    // const deletedImage = await cloudinary.uploader.destroy(
    //   comment.image.public_url,
    //   { invalidate: true },
    // )
    const deletedComment = await prisma.comment.delete({
      where: { comment_uid: req.params.commentid },
    })
    // console.log(deletedImage, '\n cloudinary image deleted')
    console.log(deletedComment, '\n Comment has been deleted')

    return res.json({
      success: true,
      message: 'SUCCESSFULLY DELETED COMMENT',
      deletedComment,
    })
  } catch (err) {
    res
      .status(403)
      .json({
        err,
        success: false,
        message: 'there was an issue fetching the comment',
      })
  }
}
