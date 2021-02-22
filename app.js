var express = require('express');
const mongoose = require('mongoose');
const PORT=process.env.PORT || 5000;

const app = express();
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');
const postRouter = require('./routes/posts/post');
const userRouter = require('./routes/user');
const db=require('./config/config').get(process.env.NODE_ENV);


const cors = require('cors');

app.use(
  cors({
      credentials: true,
      origin: true
  })
);
app.options('*', cors());

//app use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())

//database connnection
mongoose.Promise=global.Promise;

mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to database...'))
    .catch(err => console.log('Database error:', err))

app.get('/', function (req, res) {
  res.send('Hello World!');
});

if(process.env.NODE_ENV == "production"){
  app.use(express.static('odinbook_frontend/build'))
  const path = require('path')
  app.get("*",(req,res)=>{
      res.sendFile(path.resolve(__dirname,"client","build","index.html"))
  })
}
app.listen(PORT, function () {
  console.log('Example app listening on port 5000!');
});
app.use('/api/users',userRouter);
app.use('/api/posts',postRouter);


//1peBJkpIcSjHJHRk