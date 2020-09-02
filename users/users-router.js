const express = require("express")
const bcrypt = require("bcryptjs")
const Users = require("./users-model")
const usersMiddleware = require("./users-middleware")

const router = express.Router()

router.get("/users", usersMiddleware.restrict(), async (req, res, next) => {
	try {
		res.json(await Users.find())
	} catch (err) {
		next(err)
	}
})

router.post("/users", async (req, res, next) => {
	try {
		const { username, password } = req.body
		const user = await Users.findBy({ username }).first()

		if (user) {
			return res.status(409).json({
				message: "Username is already taken",
			})
		}

		const newUser = await Users.add({
			username,
			// hash the password with a time complexity of 10
			// the time complexity here is not the number of times, 2^(number) is the number of times
			// the number we pass is telling the algorithm "how intense" we want our time complexity
			// find a sweet spot, bc each computer will run at a different speed
			// don't go over ~16 - it will take too long on any computer
			// you can't account for every machine
			// so set the time complexity as an environment variable
			// for each environment, find the sweet spot and set the environment variable
			password: await bcrypt.hash(password, 14),
		})

		res.status(201).json(newUser)
	} catch (err) {
		next(err)
	}
})

router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body
		const user = await Users.findBy({ username }).first()

		if (!user) {
			return res.status(401).json({
				message: "Invalid Credentials",
			})
		}

		// check that the password is valid
		//bcrypt has a built-in function for that
		// compare the plain text password from the request body to the hash we have stored in the database
		// returns true/false
		const passwordValid = await bcrypt.compare(password, user.password)

		// check if hash of request body password matches hash we already had
		if (!passwordValid) {
			return res.status(401).json({
				message: "Invalid Credentials"
			})
		}

		// create a new session for the user
		// super easy with express-session
		req.session.user = user

		res.json({
			message: `Welcome ${user.username}!`,
		})
	} catch (err) {
		next(err)
	}
})

router.get("/logout", usersMiddleware.restrict(), async (req, res, next) => {
	try {
		req.session.destroy((err) => {
			if (err) {
				next(err)
			} else {
				res.status(204).end()
			}
		})
	} catch (err) {
		next(err)
	}
})

module.exports = router
