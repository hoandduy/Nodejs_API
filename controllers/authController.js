const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleLogin = async (req, res) => {
	const cookies = req.cookies
	const { user, pwd } = req.body
	if (!user || !pwd) {
		return res
			.status(400)
			.json({ message: 'Username name and password are required.' })
	}

	const foundUser = await User.findOne({ username: user }).exec()
	if (!foundUser) return res.sendStatus(401) // Unauthorized
	// Evaluate password
	const match = await bcrypt.compare(pwd, foundUser.password)
	if (match) {
		const roles = Object.values(foundUser.roles).filter(Boolean)

		// create JWTs
		const accessToken = jwt.sign(
			{
				userInfo: {
					username: foundUser.username,
					roles: roles,
				},
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: '10s' },
		)
		
		const newRefreshToken = jwt.sign(
			{ username: foundUser.username },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: '1d' },
		)

		let newRefreshTokenArray = 
			!cookies?.jwt
				? foundUser.refreshToken
				: foundUser.refreshToken.filter(rt => rt !== cookies.jwt)

		if (cookies?.jwt) {
			/**
			 * ! 1. User logs but never uses RT and does not logout
			 * ! 2. RT is stolen
			 * ! 3. If 1 & 2, reuse detection is needed to clear all RTs when user logs in
			 */
			
			const refreshToken = cookies.jwt
			const foundUser = await User.findOne({ refreshToken }).exec()
			
			// ! Detected Refresh token reuse!
			if (foundUser) {
				console.log('attempted refresh token reuse at login')
				newRefreshTokenArray = []
			}
		}


		// Saving refresh token with current user
		foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
		const result = await foundUser.save()
		console.log(result)
		
		res.cookie('jwt', newRefreshToken, {
			httpOnly: true,
			sameSite: 'None',
			secure: true,
			maxAge: 24 * 60 * 60 * 1000,
		})
		res.json({
			accessToken,
		})
	} else {
		res.sendStatus(401)
	}
}

module.exports = { handleLogin }
