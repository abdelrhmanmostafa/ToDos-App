const expect = require('expect')
const request = require('supertest')
var {app} = require('../server')
const {Todo} = require('../models/todo')

const todos = [{text: "el awal"}, {text: "el tany"}]

beforeEach(function (done) {
    this.timeout(10000)
    Todo.deleteMany({}).then(() =>{
        Todo.insertMany(todos).then(() => done())
    })
})

describe('Test Post todos', function () {
    this.timeout(10000)
    it('should add new todo', (done) =>{
        var text = "post test run"
        request(app).post('/addtodos').send({text})
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
    it('shouldn\'t add a todo',(done) =>{
        request(app).post('/addtodos').send()
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

describe('Testing Get all todos',function (){
    this.timeout(10000)
    it('should get all todos',(done) =>{
        request(app).get('/getall').expect(200).expect((res) =>{
            expect(res.body.length).toBe(2)
        })
        .end(done)
    })
})