const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const BadRequestError = require('../errors/bad-request')
const UnauthenticatedError = require('../errors/unauthenticated')
const jwt = require('jsonwebtoken')
const register = async(req, res) => {
    const user = await User.create({...req.body })
    const token = user.createJWT()

    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })

}

const login = async(req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new BadRequestError('Enter email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Invalid email and password')
    }
    // compare password
    const passwordIsCorrect = await user.comparePassword(password)
    if (!passwordIsCorrect) {
        throw new UnauthenticatedError('Abey lavde sahi password daal na')
    }
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {
    register,
    login
}