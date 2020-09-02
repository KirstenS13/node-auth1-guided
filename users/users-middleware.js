const bcrypt = require("bcryptjs")
const Users = require("./users-model")

function restrict() {
    // put error message in variable so it can be reused
    const authError = {
        message: "Invalid credentials"
    }

    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json(authError)
            }

            // below is no longer necessary because we're using sessions

            // const { username, password } = req.headers
            // if (!username || !password) {
            //     return res.status(401).json(authError)
            // }

            // const user = await Users.findBy({ username }).first()
            // // make sure user exists in the database
            // if (!user) {
            //     return res.status(401).json(authError)
            // }

            // const passwordValid = await bcrypt.compare(password, user.password)

            // if (!passwordValid) {
            //     return res.status(401).json(authError)
            // }

            // if we reach this point the user is authenticated
            next()

        } catch (err) {
            next(err)
        }
    }
}

module.exports = {
    restrict
}