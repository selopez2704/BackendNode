var Usuario = require('../models/usuario');
const { update } = require('../models/usuario');

module.exports = {
    list: async function(req, res, next){
        res.render('usuario/index', {usuarios: await Usuario.find({})});
    },
    update_get: async function(req, res, next){  
        res.render('usuario/update', {errors:{}, usuario: await Usuario.findById(req.params.id)});
    },
    update: async function(req, res, next){
        try {
            var update_values = {nombre: req.body.nombre};
            await Usuario.findByIdAndUpdate(req.params.id, update_values);
            res.redirect('/usuario');
        } catch (err) {
            console.log(err);
            res.render('usuario/update', {errors: err.errors, usuario: new Usuario({nombre: req.body.nombre, email: req.body.email})});
        }
    },
    create_get: function(req, res, next){
        res.render('usuario/create', {errors:{}, usuario: new Usuario()});
    },
    create: async function(req, res, next){
        if(req.body.password != req.body.confirm_password){
            res.render('usuario/create', {errors:{confirm_password: {message: 'No coinciden el password ingresado.'}}, usuario: new Usuario({nombre: req.body.nombre, email:req.body.email})});
            return;
        }
        try {
            const nuevoUsuario = await Usuario.create({nombre: req.body.nombre, email: req.body.email, password: req.body.password});
            nuevoUsuario.enviar_email_bienvenida();
            res.redirect('/usuario');
        } catch (err) {
            res.render('usuario/create', {errors: err.errors, usuario: new Usuario({nombre: req.body.nombre, email: req.body.email})});
        }
    },
    delete: async function(req, res, next){
        try {
            await Usuario.findByIdAndDelete(req.body.id);
            res.redirect('/usuario');
        } catch (err) {
            next(err);
        }
    }
}