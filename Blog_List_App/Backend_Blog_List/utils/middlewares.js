const logger = require('./logger')
const User = require('../models/schema/user')
const jwt = require('jsonwebtoken')
const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    }

    next(error)
}

const userExtractor = (request, response, next) => {
    let authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', "")
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const userId = decodedToken.id
        const user = User.findById(userId)
        request.token = token
        request.user = user

    }
    next()
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    userExtractor
}