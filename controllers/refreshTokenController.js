const User = require('../model/User')
const jwt = require('jsonwebtoken')

const handleRefreshToken = async (req, res) => {
	const cookies = req.cookies

	if (!cookies?.jwt) return res.sendStatus(401)

	const refreshToken = cookies.jwt
	res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

	const foundUser = await User.findOne({ refreshToken }).exec()

	// Detective refresh token reuse!
	if (!foundUser) {
		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				if (err) return res.sendStatus(403) // Forbidden

				const hackedUser = await User.findOne({
					username: decoded.usename,
				}).exec()
				hackedUser.refreshToken = []

				const result = await hackedUser.save()
				console.log(
					'🚀 ~ file: refreshTokenController.js ~ line 21 ~ jwt.verify ~ result',
					result,
				)
			},
		)
		return res.sendStatus(403) // Forbidden
	}

	const newRefreshTokenArray = foundUser.refreshToken.filter(
		rt => rt !== refreshToken,
	)

	// Evaluate jwt
	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		async (err, decoded) => {
			if (err) {
				foundUser.refreshToken = [...newRefreshTokenArray]
				const result = await foundUser.save()
			}
			if (err || foundUser.username !== decoded.username)
				return res.sendStatus(403)

			// Refresh token was still valid
			const roles = Object.values(foundUser.roles)
			const accessToken = jwt.sign(
				{
					userInfo: {
						username: decoded.username,
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

			// Saving refresh token with current user
			foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
			const result = await foundUser.save()

			res.cookie('jwt', newRefreshToken, {
				httpOnly: true,
				sameSite: 'None',
				secure: true,
				maxAge: 24 * 60 * 60 * 1000,
			})

			res.json({ accessToken })
		},
	)
}

module.exports = { handleRefreshToken }
