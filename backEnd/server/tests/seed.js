const {Todo} = require('../models/todo')
const {ObjectID} = require('mongodb')
const {User} = require('../models/user')
const jwt = require('jsonwebtoken')


let user1id = new ObjectID()
let user2id = new ObjectID()
const users = [{_id: user1id, email: 'user1@example.com', password: '1234user', 
                tokens: [{access: 'auth', token: jwt.sign({id: user1id, access: 'auth'}, process.env.JWT_SALT).toString()}]},
            {_id: user2id, email: 'user2@example.com', password: '1234user',
            tokens: [{access: 'auth', token: jwt.sign({id: user2id, access: 'auth'}, process.env.JWT_SALT).toString()}]}]

const todos = [{_id: new ObjectID(), text: "el awal", user: user1id},
                {_id: new ObjectID(), text: "el tany", completed: true, completedAt: 1234, user: user2id}]

let fillTodos = function (done) {
    this.timeout(10000)
    Todo.deleteMany({}).then(() =>{
        return Todo.insertMany(todos)
    }).then(() => done())
}

let fillUsers = function(done){
    this.timeout(10000)
    User.deleteMany({}).then(() =>{
        let user1 = new User(users[0]).save()
        let user2 = new User(users[1]).save()
        return Promise.all([user1, user2])
    }).then(() => done())
}

module.exports = {todos, fillTodos, fillUsers, users}