const userDB = {
	users: require('../model/users.json'),
	setUsers: function (data) {
		this.users = data
	},
}

const fsPromise = require('fs').promises
const path = require('path')
const bcrypt = require('bcrypt')

const handleNewUser = async (req, res) => {
	const { user, pwd } = req.body
	if (!user || !pwd) {
		return res
			.status(400)
			.json({ message: 'User name and password are required.' })
	}

	// check for duplicate usernames in db
	const duplicate = userDB.users.find((person) => person.username === user)
	if (duplicate) return res.sendStatus(409) // conflict with existing
	try {
		// ecrypt password
		const hashPwd = await bcrypt.hash(pwd, 10)
		// store the new user
		const newUser = { username: user, password: hashPwd }
		userDB.setUsers([...userDB.users, newUser])
		await fsPromise.writeFile(
			path.join(__dirname, '..', 'model', 'users.json'),
			JSON.stringify(userDB.userDB.users),
		)
		console.log(userDB.users)
		res.status(201).json({ success: `New user ${user} created` })
	} catch (err) {
		res.status(500).json({ meassage: err.message })
	}
}

module.exports = {
	handleNewUser,
}
