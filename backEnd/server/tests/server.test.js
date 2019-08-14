const expect = require('expect')
const request = require('supertest')
const {app} = require('../server')
const {Todo} = require('../models/todo')
const {User} = require('../models/user')
const {ObjectID} = require('mongodb')
const {todos, fillTodos, fillUsers, users} = require('./seed')

beforeEach(fillUsers)
beforeEach(fillTodos)

describe('Test Post todos', function () {
    this.timeout(10000)
    it('Should Add new Todo', (done) =>{
        var text = "post test run"
        request(app).post('/todos').send({text}).set('x-auth', users[0].tokens[0].token)
        .expect(200).expect((res) =>{
            expect(res.body.text).toBe(text)
        })
        .end((err,res) =>{
            if(err)
                return done(err)
            Todo.find({text}).then((todos) =>{
                expect(todos.length).toBe(1)
                expect(todos[0].text).toBe(text)
                done()
            }).catch((E) => done(E))
        })
    })
    it('Shouldn\'t Add a Todo',(done) =>{
        request(app).post('/todos').send().set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end((err,res) =>{
            if(err)
                return done(err)
            Todo.find().then((todos) =>{
                expect(todos.length).toBe(2)
                done()
            }).catch((E) => done(E))
        })
    })
})

describe('Testing Get all Todos',function (){
    this.timeout(10000)
    it('Should get all todos',(done) =>{
        request(app).get('/todos').set('x-auth', users[0].tokens[0].token)
        .expect(200).expect((res) =>{
            expect(res.body.length).toBe(1)
        })
        .end(done)
    })
})

describe('Testing Get Todos by ID',function (){
    this.timeout(10000)
    it('Should Get the correct Todo', (done)=>{
        request(app).get(`/todos/${todos[0]._id}`).set('x-auth', users[0].tokens[0].token)
        .expect(200).expect((res) =>{
            expect(res.body.text).toBe(todos[0].text)
        }).end(done)
    })

    it('Should not get todo created by other user', (done)=>{
        request(app).get(`/todos/${todos[1]._id}`).set('x-auth', users[0].tokens[0].token)
        .expect(404).end(done)
    })

    it('Should not return a Doc [ID not found]', (done) =>{
        let id = new ObjectID()
        request(app).get(`/todos/${id}`).set('x-auth', users[0].tokens[0].token)
        .expect(404).end(done)
    })

    it('Should not return a Doc [ID is invalide]', (done) =>{
        request(app).get('/todos/123456').set('x-auth', users[0].tokens[0].token)
        .expect(404).end(done)
    })
})

describe('Testing Delete Todos', function (){
    this.timeout(10000)
    it('Should Delete Todo',(done) =>{
        request(app).delete(`/todos/${todos[0]._id}`).set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) =>{
            expect(res.body.text).toBe(todos[0].text)
        })
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(1)
            },(e)=> done())
        }).end(done)
    })

    it('Should Not Delete Todo If not the own user',(done) =>{
        request(app).delete(`/todos/${todos[1]._id}`).set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2)
            },(e)=> done())
        }).end(done)
    })

    it('Should not Delete Todo [ID not found]',(done) =>{
        let id = new ObjectID()
        request(app).delete(`/todos/${id}`).set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2)
            },(e)=> done())
        }).end(done)
    })
    it('Should not Delete Todo [ID is invalide]',(done) =>{
        let id = todos[0]._id + '11'
        request(app).delete(`/todos/${id}`).set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2)
            },(e)=> done())
        }).end(done)
    })
})

describe('Testing Update Todos', function(){
    this.timeout(10000)
    it('Should Update Todo To Be Completed',(done)=>{
        request(app).patch(`/todos/${todos[0]._id}`).send({ completed: true}).set('x-auth', users[0].tokens[0].token)
        .expect(200).expect((res) =>{
            expect(res.body.completed).toBe(true)
            expect(res.body.completedAt).toBeDefined()
        })
        .end(done)
    })

    it('Should Not Update Todo If Not The Own User',(done)=>{
        request(app).patch(`/todos/${todos[1]._id}`).send({ completed: true}).set('x-auth', users[0].tokens[0].token)
        .expect(404).end(done)
    })

    it('Should Update Todo To Be Not Completed',(done)=>{
        request(app).patch(`/todos/${todos[1]._id}`).send({ completed: false}).set('x-auth', users[1].tokens[0].token)
        .expect(200).expect((res) =>{
            expect(res.body.completed).toBe(false)
            expect(res.body.completedAt).toBeNull()
        })
        .end(done)
    })
})

describe('Test get indevidual user', function(){
    this.timeout(10000)
    it('should return user if authenticated', (done) =>{
        request(app).get('/users/me').set('x-auth', users[0].tokens[0].token)
        .expect(200).expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString())
            expect(res.body.email).toBe(users[0].email)
        }).end(done)
    })
    it('should return 401 if not authenticated', (done) =>{
        request(app).get('/users/me')
        .expect(401).expect((res) =>{
            expect(res.body).toEqual({})
        }).end(done)
    })
})

describe('Test Post Users', function(){
    this.timeout(10000)
    it('Should Creat a User', (done) =>{
        request(app).post('/users').send({email: 'bo5a@example.com', password: '12345678'})
        .expect(200).expect((res) =>{
            expect(res.body.email).toBe('bo5a@example.com')
            expect(res.headers['x-auth']).toBeDefined()
            expect(res.body._id).toBeDefined()
            User.find().then((data) =>{
                expect(data.length).toBe(3)
            })
        }).end(done)
    })
    it('Should Return Validation Error if Request Invalide', (done) =>{
        request(app).post('/users').send({email: 'bo5a@examp', password: '1234568'})
        .expect(400).end(done)
    })
    it('should not creat user if email is used', (done) =>{
        request(app).post('/users').send({email: users[0].email, password: users[0].password})
        .expect(400).end(done)
    })
})

describe('Test User Login', function(){
    this.timeout(10000)
    it('should login user and return auth token', (done) =>{
        request(app).post('/users/login').send({email: users[1].email, password: users[1].password})
        .expect(200).expect((res) =>{
            expect(res.headers['x-auth']).toBeDefined()
        }).end((err, res) =>{
            if(err)
                return done(err)
            User.findById(users[1]._id).then((user) =>{
                expect(user.tokens.length).toBe(2)
                expect(user.tokens[1].token).toBe(res.headers['x-auth'])
                done()
            }).catch((e) => done(e))
        })
    })
    it('should not return x-auth header and reject login',(done) =>{
        request(app).post('/users/login').send({email: users[1].email, password: '12345678'})
        .expect(400).expect((res) =>{
            expect(res.headers['x-auth']).toBeUndefined()
        }).end(done)
    })
})

describe('Test Delete Token [logout user]', function(){
    this.timeout(10000)
    it('should delete the token', (done) =>{
        request(app).delete('/users/me/token').set('x-auth', users[0].tokens[0].token)
        .expect(200).end((err, res) =>{
            if(err)
                return done(err)
            User.findById(users[0]._id).then((user) =>{
                expect(user.tokens.length).toBe(0)
                done()
            }).catch((e) => done(e))
        })
    })
})