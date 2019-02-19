var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var path = require('path');
var cors = require('cors');
var app = express();
var User = require('./models/Users');
var passport = require('passport');
require('./config/passport')(passport);

const port = 3000;
const route = require('./routes/route');

var io = require('socket.io').listen(app.listen(port,() =>{

    console.log("We are connected at port: " + port);
}));

mongoose.connect("mongodb://localhost/StockMarketDatabase", ()=> {
    console.log("connected to the mongo database through mongoose")
    var user = new User({
        username: 'admin',
        password: 'admin'
    });

    User.findOne({username: 'admin'}, function (err, result) {
        if(!result){
        user.save(function (err) {
            if(err){
                console.log(err);
                console.log('User made before');
            } else{
                console.log('User created');
            }
            })
        }
    });

});

io.sockets.on('connection', function(){});

app.get('/',(req,res) =>{});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(cors());

app.use(express.static(path.join(__dirname)));

app.use(function(req,res,next){
    req.io = io;
    next();
});
app.use('/api', route);