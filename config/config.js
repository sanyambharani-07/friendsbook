 
const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: 'mongodb+srv://sanyam:1peBJkpIcSjHJHRk@cluster0.4ndnj.mongodb.net/friendsbook?retryWrites=true&w=majority'
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb+srv://sanyam:1peBJkpIcSjHJHRk@cluster0.4ndnj.mongodb.net/friendsbook?retryWrites=true&w=majority'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}