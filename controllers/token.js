var Usuario = require("../models/usuario");
var Token = require("../models/token");

module.exports = {
    confirmationGet: async function (req, res, next) {
        try {
            var token = await Token.findOne({ token: req.params.token });
            if (!token)
                return res.status(400).send({
                    type: "not-verified",
                    msg: "No encontramos usuario con este token: el token ha expirado.",
                });
        } catch (err) {}

        var usuario = await Usuario.findById(token._userId);
        if (!usuario)
            return res.status(400).send({
                msg: "No encontramos el usaurio con este token: indicado.",
            });
        if (usuario.verificado) return res.redirect("/usuarios");
        usuario.verificado = true;
        try {
            await usuario.save();
            res.redirect("/");
        } catch (err) {
            return res.status(500).send({ msg: err.message });
        }
    },
};
