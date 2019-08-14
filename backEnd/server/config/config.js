let enve = process.env.NODE_ENV || "dev"


if(enve === 'test' || enve === 'dev'){
    let config = require('./config.json')
    process.env = {  ...config[enve]  }
}

/*if(env === "development"){
    process.env.PORT = 3000
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp'
}else if(env === "test"){
    process.env.PORT = 3000
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest'
}*/