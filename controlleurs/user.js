const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const maskdata = require('maskdata');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const User = require('../models/User');




var schemaPassword = new passwordValidator();

schemaPassword
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    .is().not().oneOf(['Password', 'password', '123456789', 'mot de passe']);

exports.signup = (req, res, next) => {
    if(!schemaPassword.validate(req.body.password) || !emailValidator.validate(req.body.email)) {
        if(!schemaPassword.validate(req.body.password)) {
            return res.status(400).json({
                error: new Error("Attention le mot de passe manque aux norme de sécurité, merci de mettre minimum 8 caractère, 1 majuscule, 1 minuscule, aucun espace"),
            })
        } 
        if(!emailValidator.validate(req.body.email)) {
            return res.status(400).json({message: "Merci de formuler correctement votre adresse mail"})
        }
    } else if(schemaPassword.validate(req.body.password) || emailValidator.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
          const user = new User({
            email: maskdata.maskEmail2(req.body.email),
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }
    
  };

exports.login = (req, res, next) => {
    
    User.findOne({email: maskdata.maskEmail2(req.body.email)})
        .then(user => {
            if(user === null) {
                res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if(!valid) {
                            res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: "24h" }
                                )
                            });
                        }
                    })
                    .catch(error => {
                        res.status(500).json( {error} );
                    })
            }
        })
        .catch(error => {
            res.status(500).json( {error} );
        })
};