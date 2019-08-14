const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let schema = mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email"
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    },
    tokens:[{
        access:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }
    }]
})

schema.methods.generateAuthtoken = function(){
    let access = "auth"
    let token = jwt.sign({id: this._id, access}, "123abd").toString()
    this.tokens.push({access, token})
    return this.save().then(() =>{
        return token
    })
}

schema.methods.deleteToken = function(token){
    return this.update({$pull: {tokens: {token}}})
}

schema.statics.findByToken = function(token){
    let decoded
    try {
        decoded = jwt.verify(token, "123abd")
    } catch (error) {
        return Promise.reject()
    }
    return this.findOne({
        _id: decoded.id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

schema.statics.findByCredentials = function(email, password){
    return this.findOne({email}).then((user) =>{
        if(!user)
            return Promise.reject()
        return new Promise((resolve, reject) =>{
            bcrypt.compare(password, user.password, (err, result) =>{
                if(result){
                    resolve(user)
                }else{
                    reject()
                }
            })
        })
    })
}

schema.methods.toJSON = function(){
    let userobj = this.toObject()
    return _.pick(userobj, ['_id', 'email'])
}

schema.pre('save', function (next){
    if(this.isModified('password')){
        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(this.password, salt, (err, hash) =>{
                this.password = hash
                next()
            })
        })
    }else next()
})

var User = mongoose.model('User', schema)

module.exports = {User}