const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport'); 
const Merchant = require('../model/Merchant'); 

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'username' }, (username, password, done) => {

            //match user
            Merchant.findOne({username:username})
            .then(merchant => {
                if(!merchant){
                    return done(null, false, {message: 'That email is not registered'});
                }

                //Match password
                bcrypt.compare(password, merchant.password, (err, isMatch) =>{
                    if (err) throw err;

                    if(isMatch){
                        return done(null, merchant);
                    }
                    else{
                        return done(null, false, {merchant: 'password incorrect'})
                    }
                })
            })
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser((Merchant, done)=> {
        done(null, Merchant.id);
    });

    
    passport.deserializeUser((id, done)=> {
        Merchant.findById(id, (err, Merchant) => {
            done(err, Merchant);
        });
    });
}
