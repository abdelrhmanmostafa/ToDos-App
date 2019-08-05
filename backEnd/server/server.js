var {mongoose} = require('./mongoose')
var {Todo} = require('./models/todo')
var express = require('express')
var bodyparser = require('body-parser')
var fs = require('fs')

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
app.listen(3000, ()=>{
    console.log('server start on port 3000')
})