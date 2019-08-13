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
        request(app).post('/todos').send({text})
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
        request(app).post('/todos').send()
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
        request(app).get('/todos').expect(200).expect((res) =>{
            expect(res.body.length).toBe(2)
        })
        .end(done)
    })
})

describe('Testing Get Todos by ID',function (){
    this.timeout(10000)
    it('Should Get the correct Todo', (done)=>{
        request(app).get(`/todos/${todos[0]._id}`).expect(200)
        .expect((res) =>{
            expect(res.body.text).toBe(todos[0].text)
        }).end(done)
    })

    it('Should not return a Doc [ID not found]', (done) =>{
        let id = new ObjectID()
        request(app).get(`/todos/${id}`).expect(404).end(done)
    })

    it('Should not return a Doc [ID is invalide]', (done) =>{
        request(app).get('/todos/123456').expect(404).end(done)
    })
})

describe('Testing Delete Todos', function (){
    this.timeout(10000)
    it('Should Delete Todo',(done) =>{
        request(app).delete(`/todos/${todos[0]._id}`).expect(200)
        .expect((res) =>{
            expect(res.body.text).toBe(todos[0].text)
        })
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(1)
            },(e)=> done())
        }).end(done)
    })
    it('Should not Delete Todo [ID not found]',(done) =>{
        let id = new ObjectID()
        request(app).delete(`/todos/${id}`).expect(404)
        .expect(()=>{
            Todo.find().then((todos)=>{
                expect(todos.length).toBe(2)
            },(e)=> done())
        }).end(done)
    })
    it('Should not Delete Todo [ID is invalide]',(done) =>{
        let id = todos[0]._id + '11'
        request(app).delete(`/todos/${id}`).expect(404)
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
        request(app).patch(`/todos/${todos[0]._id}`).send({ completed: true})
        .expect(200).expect((res) =>{
            expect(res.body.completed).toBe(true)
            expect(res.body.completedAt).toBeDefined()
        })
        .end(done)
    })
    it('Should Update Todo To Be Not Completed',(done)=>{
        request(app).patch(`/todos/${todos[1]._id}`).send({ completed: false})
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