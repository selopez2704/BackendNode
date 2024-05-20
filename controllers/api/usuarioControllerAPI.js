var Usuario = require('../../models/usuario');

exports.usuarios_list = async function(req, res){
    await Usuario.find({}).then((usuarios) => {
        res.status(200).json({
            usuarios: usuarios
        })
    });
};

exports.usuarios_create = async function(req, res){
    var usuario = new Usuario({ nombre: req.body.nombre, email: req.body.email, password: req.body.password });
    
    await usuario.save()
    res.status(200).json(usuario)
};

exports.usuario_reservar = async function(req, res){
    var usuario = await Usuario.findById(req.body.id);
    // console.log(usuario);
    await usuario.reservar(req.body.bici_id, req.body.desde, req.body.hasta).then(
        res.status(200).send()
    );
};
