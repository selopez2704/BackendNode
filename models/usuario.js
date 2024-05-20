var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Reserva = require("./reserva");

const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const saltRounds = 10;

const Token = require("./token");
const mailer = require("../mailer/mailer");

const validateEmail = function (email) {
    const re =
        /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
    return re.test(email);
};

var usuarioSchema = new Schema({
    nombre: {
        type: String,
        trim: true,
        required: [true, "El nombre es obligatorio"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "El email es obligatorio"],
        lowercase: true,
        unique: true,
        validate: [validateEmail, "Por Favor, ingrese un email valido"],
        match: [
            /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i,
        ],
    },
    password: {
        type: String,
        required: [true, "El password es obligatorio"],
    },
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    verificado: {
        type: Boolean,
        default: false,
    },
    googleId: String,
    facebookId: String
});

usuarioSchema.plugin(uniqueValidator, {
    message: "El {PATH} ya existe con otro usuario.",
});

usuarioSchema.pre("save", function (next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, saltRounds);
    }
    next();
});

usuarioSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

usuarioSchema.methods.reservar = async function (biciId, desde, hasta) {
    var reserva = new Reserva({
        usuario: this._id,
        bicicleta: biciId,
        desde: desde,
        hasta: hasta,
    });
    // console.log(reserva);
    await reserva.save();
};

usuarioSchema.methods.enviar_email_bienvenida = async function (cb) {
    const token = new Token({
        _userId: this.id,
        token: crypto.randomBytes(16).toString("hex"),
    });
    const email_destination = this.email;

    try {
        await token.save();
        const mailOption = {
            from: process.env.from_email,
            to: email_destination,
            subject: "Verificacion de cuenta",
            text:
                "Hola \n\n" +
                "Por favor, para verificar su cuenta haga click en el siguiente link:\n\n" +
                // process.env.HOST + '/token/confirmation/' + token.token + '\n'
                "http://localhost:3000" +
                "/token/confirmation/" +
                token.token +
                "\n",
        };

        mailer.sendMail(mailOption, function (err) {
            if (err) {
                return console.log(err.message);
            }

            console.log(
                "Se ha enviado correo de verifiacion a:" + email_destination
            );
            cb(null);
        });
    } catch (err) {
        return cb(err);
    }
};

usuarioSchema.methods.resetPassword = async function (cb) {
    const token = new Token({
        _userId: this.id,
        token: crypto.randomBytes(16).toString("hex"),
    });
    const email_destination = this.email;
    try {
        await token.save();
        const mailOption = {
            from: "no-reply@red-bicicleta.com",
            to: email_destination,
            subject: "Reseteo de password de cuenta",
            text:
                "Hola \n\n" +
                "Por favor, para resetear su cuenta haga click en el siguiente link:\n\n" +
                "http://localhost:3000" +
                "/resetPassword/" +
                token.token +
                "\n",
        };
        mailer.sendMail(mailOption, function (err) {
            if (err) {
                return cb(err);
            }

            console.log(
                "Se envio un email para resetear el password a:" +
                    email_destination +
                    "."
            );
        });

        cb(null);
    } catch (err) {
        return cb(err);
    }
};

usuarioSchema.statics.findOneOrCreateByGoogle =
    async function findOneOrCreate(condition) {
        const self = this;
        console.log(condition);
        try {
            let result = await self.findOne({
                $or: [
                    { googleId: condition.id },
                    { email: condition.emails[0].value },
                ],
            });
            if (result) {
               return result;
            } else {
                console.log("----------------CONDITION----------------");
                console.log(condition);
                let values = {};
                values.googleId = condition.id;
                values.email = condition.emails[0].value;
                values.nombre = condition.displayName || "Sin nombre";
                values.verificado = true;
                values.password = condition._json.sub;
                console.log("-----------------VALUES------------------");
                console.log(values);

                let result = await self.create(values);
                return result;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

usuarioSchema.statics.findOneOrCreateByFacebook =
    async function findOneOrCreate(condition) {
        const self = this;
        console.log(condition);
        try {
            let result = await self.findOne({
                $or: [
                    { facebookId: condition.id },
                    { email: condition.emails[0].value },
                ],
            });
            if (result) {
               return result;
            } else {
                console.log("----------------CONDITION----------------");
                console.log(condition);
                let values = {};
                values.googleId = condition.id;
                values.email = condition.emails[0].value;
                values.nombre = condition.displayName || "Sin nombre";
                values.verificado = true;
                values.password = crypto.randomBytes(16).toString('hex');
                console.log("-----------------VALUES------------------");
                console.log(values);

                let result = await self.create(values);
                return result;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

module.exports = mongoose.model("Usuario", usuarioSchema);
