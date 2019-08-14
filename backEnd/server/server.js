require('./config/config')

var {mongoose} = require('./mongoose')
var {Todo} = require('./models/todo')
var {User} = require('./models/user')

const express = require('express')
const bodyparser = require('body-parser')
const fs = require('fs')
const {ObjectID} = require('mongodb')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

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

let Authenticate = (req, res, next) =>{
    User.findByToken(req.header('x-auth')).then((user) =>{
        if(!user)
            return Promise.reject()
        req.user = user
        req.token = req.header('x-auth')
        next()
    }).catch((e) =>{
        res.status(401).send()
    })
}

app.post('/todos', Authenticate, (req, res) =>{
    var todo = new Todo({
        text: req.body.text,
        user: req.user._id
    })
    todo.save().then((doc) =>{
        res.send(doc)
    }, (e)=>{
        res.status(400).send(e)
    })
})

app.get('/todos', Authenticate, (req, res) =>{
    Todo.find({user: req.user._id}).then((data) => {
        res.send(data)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

app.get('/todos/:id', Authenticate, (req, res) =>{
    let id = req.params.id
    if(!ObjectID.isValid(id))
        res.status(404).send()
    else{
        Todo.findOne({_id: id, user: req.user._id}).then((todo) =>{
            if(todo)
                res.send(todo)
            else
                res.status(404).send()
        },(e) =>{
            res.status(400).send()
        })
    }
})

app.delete('/todos/:id', Authenticate, (req, res) =>{
    let id = req.params.id
    if(!ObjectID.isValid(id))
        return res.status(404).send()
    Todo.findOneAndDelete({_id: id, user: req.user._id}).then((todo) =>{
        if(!todo)
            return res.status(404).send()
        res.send(todo)
    }, (e) =>{
        res.status(404).send()
    })
})

app.patch('/todos/:id', Authenticate, (req, res) =>{
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
    Todo.findOneAndUpdate({_id: id, user: req.user._id}, {$set: body}, {new: true}).then((todo) =>{
        if(!todo)
            return res.status(404).send()
        res.send(todo)
    }).catch((e) =>{
        res.status(400).send()
    })
})

//User Routes

app.post('/users',(req, res) =>{
    let user = new User(_.pick(req.body, ['email', 'password']))
    /*user.save().then(() =>{
        return user.generateAuthtoken()
    }).then((token) =>{
        res.header('x-auth', token).send(user)
    }).catch((e)=>{
        res.status(400).send(e)
    })*/
    user.generateAuthtoken().then((token) =>{
        res.header('x-auth', token).send(user)
    }).catch((e)=>{
        res.status(400).send(e)
    })
})

app.get('/users/me', Authenticate, (req, res) =>{
    res.send(req.user)
})

app.post('/users/login', (req, res) =>{
    let body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user) =>{
        return user.generateAuthtoken().then((token) =>{
            res.header('x-auth', token).send(user)
        })
    }).catch((e) =>{
        res.status(400).send()
    })
})

app.delete('/users/me/token', Authenticate, (req, res) =>{
    req.user.deleteToken(req.token).then(() =>{
        res.send()
    }).catch((e) => res.status(400).send())
})

app.listen(process.env.PORT, ()=>{
    console.log(`server start on port ${process.env.PORT}`)
})

module.exports = {app}