const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        if (req.body.userId && req.body.userId !== userId) {
            throw "403: unauthorized request";
          } else {

            const day = 1000 * 60 * 60 *24;

            session => ({
            secret: "abcdefghijklmnop123456789",
            saveUninitialized: true,
            cookie: { maxAge: day},
            resave: false
            });

            cookieParser();

            // tout va bien on peut passer la requete on passe à la suite
      
            next();
          }
    } catch (error){
        res.status(401).json({ error });
    }
};