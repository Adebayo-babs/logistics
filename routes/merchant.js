const express = require('express'),
router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

 const Merchant = require('../model/Merchant');
 const Order = require('../model/Order');

 let fs = require('fs');
let path = require('path');
let multer = require('multer');

 // MULTER
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
      console.log(file);
      cb(null, file.fieldname +'-'+ Date.now());
    }
  })
  
  let upload = multer({storage:storage});
  
//Signup Handle

router.get('/signup', (req, res) => {
    res.render('signup');
})


router.post('/signup', upload.single('image'), (req, res)=>{
    const{fName, lName, cEmail,cNumber,address, yearsOfExp, 
         username, password,password2,date} = req.body;

    let errors = [];

    //Check passwords match

    if(password !== password2){
        errors.push({msg: "Passwords do not match"});
        req.flash('error_msg', 'Passwords do not match') 
    }

    //Check password length
    if(password.length < 8){
        errors.push({msg: "password should be at least eight characters"})
    }

    if(errors.length > 0){
        res.render('signup', {
            errors,
            fName, lName, cEmail,cNumber,address, yearsOfExp, 
         username, password,password2
        });

    }else{
        //validation passed
            Merchant.findOne({ username: username  })
            .then(merchant => {
                if(merchant){
                    //user exists
                    errors.push({msg: 'Username is already registered'});
                    res.render('signup', {
                        errors,
                        fName, lName, cEmail,cNumber,address, yearsOfExp, 
                        username, password,password2
                    });

                }
                else{
                    const newMerchant = new Merchant({
                        fName, lName, cEmail,cNumber,address, yearsOfExp, 
         username, password, date,  upload:{
            data:fs.readFileSync(path.join('C:/Users/HP/Desktop/FULLSTACK/LOGISTICS'+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }

                    });
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newMerchant.password, salt, (err, hash) => {
                            if(err) throw err;

                            //Set password hashed
                            newMerchant.password = hash;

                            //Save new user
                            newMerchant.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now successfully registered and can log in')
                                res.redirect('/merchant/login');
                            })
                            .catch(err => console.log(err))
                    }))

                }
            });
    }
});

//login handle

router.get('/login', (req, res) => {

    res.render('login');

})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/merchant/dashboard',
        failureRedirect:'/merchant/login',
        failureFlash:true
    })(req, res, next);
} );


//Dashboard

router.get('/dashboard', ensureAuthenticated, (req,res)=>{

        Merchant.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                console.log(req.user.username)
                res.render('dashboard', {record,username:req.user.username})
            }
        })

})

// Take Order

router.get('/takeOrder', ensureAuthenticated, (req,res)=>{

        Order.find({username:req.user.username}, function(err){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                // console.log(req.user.username)
                res.render('takeOrder', {username:req.user.username})
            }
        })

})



router.post('/takeOrder', upload.single('image'), (req, res)=>{
    const{pName, pType, price, address, time, dDate} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('takeOrder', {
            errors,
            pName, pType, price, address, time, dDate
        });

    }else{
        //validation passed            
            const newOrder = new Order({
                        pName, pType, price, address, time, dDate, username:req.user.username,  upload:{
            data:fs.readFileSync(path.join('C:/Users/HP/Desktop/FULLSTACK/LOGISTICS'+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }

        });

            //Save new Order
            newOrder.save()
            .then(user => {
            req.flash('success_msg', 'Order added successfully')
            res.redirect('/merchant/takeOrder');
            })
            .catch(err => console.log(err))
                    }

    });

//View Properties

router.get('/viewOrder', ensureAuthenticated, (req,res)=>{

        Order.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                console.log(req.user.username)
                res.render('viewOrders', {record,username:req.user.username})
            }
        })

});

router.get('/edit/:pid', (req, res) => {
    Order.find({_id:req.params.pid}, (error, record) => {
                if (error) {
                    req.flash('error_msg', "Could not query database")
                    res.redirect('/edit/:pid');
                } else {
                    res.render('editPage', {record, username:req.user.username});
                }
            })
});

router.post('/edit/:pid', (req, res) => {
    
            const {pName, pType, price, address, time, dDate, date} = req.body;

            Order.updateOne({_id:req.params.pid}, {$set:{pName, pType, price, address, time, dDate, date}}, (err, record) => {
                if (err) {
                    req.flash('error_msg', "Could not update Order");
                    res.redirect('/edit/:pid');
                } else {
                    req.flash('message', "Order successfully updated");
                    res.redirect('/merchant/viewOrder')
                }
            })
        })

router.get('/:pid', (req, res) => {
        
         Order.deleteOne({_id:req.params.pid}, (error, record) => {
            if (error) {
                req.flash('error_msg', "Could not query database")
            } else {
                req.flash('success_msg', "Order deleted successfully");
                res.redirect('/merchant/viewOrder')
            }
        })
})
 


module.exports=router;