const express = require('express');
const router = express.Router();
var User = require('../models/Users');
var jwt = require ('jsonwebtoken');
var passport = require('passport');


const Stock = require('../models/Stock');

router.get('/stocks', (req, res, next) =>{
    Stock.find(function (err, stock) {
        res.json(stock);
    })
});

router.post('/stocks', passport.authenticate('jwt', {session: false}), (req,res,next) =>{
    let newStock = new Stock({
        name: req.body.name,
        });
    
    newStock.save((err, stock)=>{
        if(err){
            res.json({msg: "failed to create stock"});
        } else{
            req.io.sockets.emit('createStock', stock);
            res.json({msg: "stock created"});
        }
    })

});

router.delete('/stocks/:_id', passport.authenticate('jwt', {session: false}), (req,res,next) =>{
    Stock.findOneAndRemove({_id: req.params._id}, function (err, result) {
        if(err){
            res.json(err);
        } else{
            req.io.sockets.emit('deleteStock', result);
            res.json(result);
        }
    })
});

router.put('/stocks/:_id', passport.authenticate('jwt', {session: false}),(req, res) => {
    try{

        var NewValue = {value: req.body.newValue};
        Stock.findOneAndUpdate(
            {_id :req.params._id},
            {$push: {rates: NewValue}},
            {safe: true, upsert: true, new : true},
            function(err, model) {
                if(err){
                    console.log("the stock could not be updated, please consult an admin: " + err);
                }
                res.json({message: "The stock has been updated.!"});
                req.io.sockets.emit('updateStock', model);
            }
        );
    }catch(e){
        console.log(e);
    }
    });

router.post('/signin', function (req, res) {
    User.findOne({
        username: req.body.username}, function (err, user) {
        if(err) throw err;

        if(!user){
           return res.status(401).send({succes:false, msg:"Cant log in"});
    }
    user.comparePassword(req.body.password, function(err, isMatch){
                if(isMatch && !err){
            var token = jwt.sign(user.toJSON(), "hanulubo");
            res.statusCode = 200;
            res.json({sucess:true, token:'JWT ' + token});
                }else{
            res.status(401).send({succes:false, msg:"Wrong pass"});
            }
        });
    });
});
module.exports = router;
