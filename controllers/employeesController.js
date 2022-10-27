const Employee = require('../model/Employee')

const getAllEmployees = async (req, res) => {
	const employees = await Employee.find()
	if (!employees)
		return res.status(204).json({
			message: 'No employees found.',
		})

	res.json(employees)
}

const createNewEmployee = async (req, res) => {
	if (!req?.body?.firstname || !req?.body?.lastname) {
		res.status(400).json({ message: 'First and last names are required' })
	}

	try {
		const result = await Employee.create({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
		})

		res.status(201).json(result)
	} catch (err) {
		console.error(err)
	}

	data.setEmployees([...data.employees, newEmployees])
	res.json(data.employees)
}

const updateEmployee = async (req, res) => {
	if (!req?.body?.id) {
		return res.status(400).json({
			message: 'ID parameter is required.',
		})
	}

	const employee = await Employee.findOne({ _id: req.body.id }).exec()

	if (!employee) {
		return res
			.status(204)
			.json({ massage: `No employee matches ID ${req.body.id}.` })
	}
	if (req.body?.firstname) employee.firstname = req.body.firstname
	if (req.body?.lastname) employee.lastname = req.body.lastname
	const result = await employee.save()
	res.json(result)
}

const deleteEmployee = async (req, res) => {
	if (!req?.body?.id) {
		return res.status(400).json({
			message: 'ID parameter is required.',
		})
	}

	const employee = await Employee.findById(req.body.id).exec()

	if (!employee) {
		return res
			.status(204)
			.json({ massage: `No employee matches ID ${req.body.id}.` })
	}
	await Employee.deleteOne({ _id: req.body.id })
	res.json(employee)
}

const getEmployee = async (req, res) => {
	console.log("🚀 ~ file: employeesController.js ~ line 72 ~ getEmployee ~ req", req)
	if (!req?.params?.id) {
		return res.status(400).json({
			message: 'ID parameter is required.',
		})
	}
	const employee = await Employee.findById(req.params.id)
	if (!employee) {
		return res
			.status(204)
			.json({ massage: `No employee matches ID ${req.body.id}.` })
	}
	res.json(employee)
}

module.exports = {
	getAllEmployees,
	createNewEmployee,
	updateEmployee,
	deleteEmployee,
	getEmployee,
}
