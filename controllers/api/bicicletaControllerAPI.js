var Bicicleta = require('../../models/bicicleta');

exports.bicicleta_list = async function(req, res){
    try {
        var bicicletas = await Bicicleta.allBicis();
        res.status(200).json({
            bicicletas: bicicletas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de bicicletas' });
    }
}

exports.bicicleta_create = async function(req, res){
    var bici = new Bicicleta({ code: req.body.code, color: req.body.color, modelo: req.body.modelo, ubicacion: [req.body.lat, req.body.lng]});
    await Bicicleta.add(bici);

    res.status(200).json({
        bicicleta: bici
    });
}

exports.bicicleta_delete = async function(req, res) {
    await Bicicleta.removeByCode(req.body.code);
    res.status(204).send();
}
