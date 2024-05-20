var Bicicleta = require("../../models/bicicleta");
const axios = require("axios");
var mongoose = require("mongoose");

var base_url = "http://localhost:3000/api/bicicletas";

describe("Bicicleta API", () => {
    beforeEach(async function () {
        const dbURI = "mongodb://127.0.0.1:27017/testdbapi";
        await mongoose.connect(dbURI);

        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function () {
            console.log("We are connected to test database");
        });
    });

    afterEach(async function () {
        await Bicicleta.deleteMany({}).catch((err) => {
            console.log(err);
        });
        await mongoose.connection.close();
    });

    describe("GET BICICLETAS /", () => {
        it("Status 200", async () => {
            var bicis = await Bicicleta.allBicis();
            expect(bicis.length).toBe(0);

            var a = new Bicicleta({
                code: 1,
                color: "rojo",
                modelo: "urbana",
                ubicacion: [-34.6012424, -58.3861497],
            });
            await Bicicleta.add(a);
            var bicis = await Bicicleta.allBicis();

            const response = await axios.get(base_url);
            expect(response.status).toBe(200);
            expect(response.data.bicicletas.length).toBe(1);
        });
    });

    describe("POST BICICLETAS /create", () => {
        it("Status 200", async () => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            var aBici = JSON.stringify({
                code: 3,
                color: "Naranja",
                modelo: "Montaña",
                lat: -34.6,
                lng: -58.4,
            });

            const response = await axios.post(
                base_url + "/create",
                aBici,
                config
            );

            expect(response.status).toBe(200);
            bici = response.data.bicicleta;

            expect(bici.color).toBe("Naranja");
            expect(bici.ubicacion[0]).toBe(-34.6);
            expect(bici.ubicacion[1]).toBe(-58.4);
        });
    });

    describe("DELETE BICICLETAS /delete", () => {
        it("Status 204", async () => {
            var a = Bicicleta.createInstance(
                1,
                "rojo",
                "urbana",
                [-34.6012424, -58.3861497]
            );
            await Bicicleta.add(a);

            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            var aCode = JSON.stringify({ code: 1 });

            const response = await axios.post(
                base_url + "/delete",
                aCode,
                config
            );

            expect(response.status).toBe(204);
            var bicis = await Bicicleta.allBicis();
            expect(bicis.length).toBe(0);
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

/* Version sin implementar Mongoose 
beforeEach(() => {
  Bicicleta.allBicis = [];
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
});

describe("Bicicleta API", () => {
  describe("GET BICICLETAS /", () => {
    it("Status 200", () => {
      expect(Bicicleta.allBicis.length).toBe(0);

      var a = new Bicicleta(1, "rojo", "urbana", [-34.6012424, -58.3861497]);
      Bicicleta.add(a);

      request.get(
        "http://localhost:3000/api/bicicletas",
        function (error, response, body) {
          expect(response.statusCode).toBe(200);
        }
      );
    });
  });
  describe("POST BICICLETAS /create", () => {
    it("Status 200", (done) => {
      var headers = { "Content-Type": "application/json" };
      var aBici = '{ "id": 3, "color": "Naranja", "modelo": "Montaña", "lat": -34.6, "lng": -58.4 }';

      request.post(
        {
          headers: headers,
          url: "http://localhost:3000/api/bicicletas/create",
          body: aBici
        },
        function (error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(Bicicleta.findById(3).color).toBe("Naranja");
          done();
        }
      );
    });
  });
}); */
