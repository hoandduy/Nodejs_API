const User = require('../model/User')

const getAllUser = async (req, res) => {
	const users = await User.find()
	if (!users) {
		res.status(204).json({
			message: 'No user found.',
		})
	}
	res.json(users)
}

const deleteUser = async (req, res) => {
	const id = req.body.id
	const user = await User.findById(id)
	if (!user) {
		return res.status(204).json({ massage: `No employee matches ID ${id}.` })
	}
	await User.deleteOne({ _id: id })
	res.json(user)
}

const getUser = async (req, res) => {
	const id = req.params.id
	if (!id) {
		return res.status(400).json({
			message: 'ID parameter is required.',
		})
	}
	const user = await User.findById(id)
	if (!user) {
		return res.status(204).json({ massage: `No employee matches ID ${id}.` })
	}
	res.json(user)
}

module.exports = {
	getAllUser,
	deleteUser,
	getUser
}
