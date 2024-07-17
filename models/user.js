const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },

    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

//In Mongoose, when defining static methods, you need to use a regular function instead of an arrow function to ensure that this correctly refers to the model.
userSchema.statics.findandvalidate = async function(username, password){
    const user = await this.findOne({ username: username })
    const isValid = await bcrypt.compare(password, user.password)
    return isValid? user : false
}

userSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(password, 12) //Here, password refers to the password coming from the user
    this.password = hash //this.password refers to the password residing on the userScehma which is the original password of the user
    next()
})

const User = mongoose.model("User", userSchema)
module.exports = User