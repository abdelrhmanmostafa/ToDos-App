var {mongoose} = require('../server/mongoose')
var {Todo} = require('../server/models/todo')
const {ObjectID} = require('mongodb')

Todo.findOneAndDelete("5d49c2c017ae1221908063b1").then((todo) =>{
    console.log(todo)
})