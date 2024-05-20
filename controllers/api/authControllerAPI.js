var Usuario = require("../../models/usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    authenticate: async function (req, res, next) {
        try {
            var userInfo = await Usuario.findOne({ email: req.body.email });
            if (userInfo == null) {
                return res
                    .status(401)
                    .json({
                        status: "error",
                        message: "Email/Password Invalido!",
                        data: null,
                    });
            }
            if (
                userInfo != null &&
                bcrypt.compareSync(req.body.password, userInfo.password)
            ) {
                console.log("..." + req.app.get("secretKey"));
                const token = jwt.sign(
                    { id: userInfo._id },
                    req.app.get("secretKey"),
                    { expiresIn: "7d" }
                );
                res.status(200).json({
                    message: "usuario encontrato!",
                    data: { usuario: userInfo, token: token },
                });
            } else {
                res.status(401).json({
                    status: "error",
                    message: "Email/Password Invalido!",
                    data: null,
                });
            }
        } catch (err) {
            next(err);
        }
    },
    forgotPassword: async function (req, res, next) {
        try {
            var usuario = await Usuario.findOne({ email: req.body.email });
            if (!usuario)
                return res
                    .status(401)
                    .json({ message: "No exte el usuario", data: null });
            usuario.resetPassword();
            res.status(200).json({
                message: "Se envio email para reestablecer el password",
                data: null,
            });
        } catch (err) {
            return next(err);
        }
    },
    authFacebookToken: async function(req, res, next){
        if(req.user){
            await req.user.save().then( ()=> {
              const token = jwt.sign({id: req.user.id}, req.app.get('secretKey'), {expiresIn: '7d'});
              res.status(200).json({message: "Usuario encontrado", data: {user: req.user, token: token}});  
            }).catch( (err) => {
                console.log(err);
                res.status(500).json({message: err.messsage});
            });
        }else{
            res.status(401);
        }
    },
};
