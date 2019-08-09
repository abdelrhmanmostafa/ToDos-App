require('./config')
var {mongoose} = require('./mongoose')
var {Todo} = require('./models/todo')
const express = require('express')
const bodyparser = require('body-parser')
const fs = require('fs')
const {ObjectID} = require('mongodb')
const _ = require('lodash')

var app = express()

app.use(bodyparser.json())
app.use((req, res, next) =>{
    var now = new Date().toString()
    fs.appendFile('server.log', `${now}: ${req.method}, ${req.url} \n`, (err) =>{
        if(err)
            console.log('logging error')
    })
    next()
})

app.post('/addtodos',(req, res) =>{
    var todo = new Todo({
        ...req.body
    })
    todo.save().then((doc) =>{
        res.send(doc)
    }, (e)=>{
        res.status(400).send(e)
    })
})

app.get('/getall',(req, res) =>{
    Todo.find().then((data) => {
        res.send(data)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

app.get('/todos/:id', (req, res) =>{
    let id = req.params.id
    if(!ObjectID.isValid(id))
        res.status(404).send()
    else{
        Todo.findById(id).then((todo) =>{
            if(todo)
                res.send(todo)
            else
                res.status(404).send()
        },(e) =>{
            res.status(400).send()
        })
    }
})

app.delete('/todos/:id',(req, res) =>{
    let id = req.params.id
    if(!ObjectID.isValid(id))
        return res.status(404).send()
    Todo.findByIdAndDelete(id).then((todo) =>{
        if(!todo)
            return res.status(404).send()
        res.send(todo)
    }, (e) =>{
        res.status(404).send()
    })
})

app.patch('/todos/:id',(req, res) =>{
    let id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])
    if(!ObjectID.isValid(id))
        return res.status(404).send()
    if(_.isBoolean(body.completed) && body.completed)
        body.completedAt = new Date().getTime()
    else{
        body.completed = false
        body.completedAt = null
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) =>{
        if(!todo)
            return res.status(404).send()
        res.send(todo)
    }).catch((e) =>{
        res.status(400).send()
    })
})

app.listen(process.env.PORT, ()=>{
    console.log(`server start on port ${process.env.PORT}`)
})

module.exports = {app}