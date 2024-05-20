var mongoose = require("mongoose");
var Bicicleta = require("../../models/bicicleta");
var Usuario = require("../../models/usuario");
var Reserva = require("../../models/reserva");
const reserva = require("../../models/reserva");

describe("Testing Usuario", function () {
    beforeEach(async function () {
        const dbURI = "mongodb://127.0.0.1:27017/testdb";
        await mongoose.connect(dbURI);

        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function () {
            console.log("We are connected to test database");
        });
    });

    afterEach(async function () {
        await Reserva.deleteMany({}).catch((err) => {
            console.log(err);
        });
        await Usuario.deleteMany({}).catch((err) => {
            console.log(err);
        });
        await Bicicleta.deleteMany({}).catch((err) => {
            console.log(err);
        });
        await mongoose.connection.close();
    });

    describe("Cuando un usuario reserva una bici", () => {
        it("debe existir la reserva", async () => {
            const usuario = new Usuario({ nombre: "Ezequiel" });
            await usuario.save();

            const bicicleta = new Bicicleta({
                code: 1,
                color: "verde",
                modelo: "urbana",
            });
            await bicicleta.save();

            var hoy = new Date();
            var maniana = new Date();
            maniana.setDate(hoy.getDate() + 1);

            await usuario.reservar(bicicleta.id, hoy, maniana);
            await Reserva.find({})
                .populate("bicicleta")
                .populate("usuario")
                .then((reservas) => {
                    console.log(reservas[0]);
                    expect(reservas.length).toBe(1);
                    expect(reservas[0].diasDeReserva()).toBe(2);
                    expect(reservas[0].bicicleta.code).toBe(1);
                    expect(reservas[0].usuario.nombre).toBe(usuario.nombre);
                });
            
        });
    });

    describe("Esperando...", function () {
        it("Prueba con Retardo", function (done) {
            setTimeout(function () {
                // Coloca tu código de prueba aquí
                console.log("Espera completada.");
                done(); // Asegúrate de llamar a done() para indicar que la prueba ha finalizado.
            }, 500);
        });
    });
});
