var mongoose = require("mongoose");
var Bicicleta = require("../../models/bicicleta");

describe("Testing Bicicletas", function () {
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
    await Bicicleta.deleteMany({}).catch((err) => {
      console.log(err);
    });
    await mongoose.connection.close();
  });

  describe("Bicicleta.createInstance", () => {
    it("Crea una instancia de bicicleta", (done) => {
      var bici = Bicicleta.createInstance(1, "verde", "urbana", [-34.5, -54.1]);

      expect(bici.code).toBe(1);
      expect(bici.color).toBe("verde");
      expect(bici.modelo).toBe("urbana");
      expect(bici.ubicacion[0]).toEqual(-34.5);
      expect(bici.ubicacion[1]).toEqual(-54.1);
      done();
    });
  });

  describe("Bicicleta.allBicis", () => {
    it("Comienza vacía", async () => {
      var bicis = await Bicicleta.allBicis();
      expect(bicis.length).toBe(0);
    });
  });

  describe("Bicicleta.add", () => {
    it("Agrega sólo una bici", async () => {
      var aBici = new Bicicleta({ code: 1, color: "verde", modelo: "urbana" });
      await Bicicleta.add(aBici);
      var bicis = await Bicicleta.allBicis();
      expect(bicis.length).toBe(1);
      expect(bicis[0].code).toEqual(aBici.code);
    });
  });

  describe("Bicicleta.findByCode", () => {
    it("Debe devolver la bici con el code 1", async () => {
      var bicis = await Bicicleta.allBicis();
      expect(bicis.length).toBe(0);

      var aBici = new Bicicleta({ code: 1, color: "verde", modelo: "urbana" });
      await Bicicleta.add(aBici);

      var aBici2 = new Bicicleta({ code: 2, color: "roja", modelo: "urbana" });
      await Bicicleta.add(aBici2);

      var targetBici = await Bicicleta.findByCode(1);
      expect(targetBici.code).toBe(aBici.code);
      expect(targetBici.color).toBe(aBici.color);
      expect(targetBici.modelo).toBe(aBici.modelo);
    });
  });

  describe('Esperando...', function () {
	it('Prueba con Retardo', function (done) {
	  setTimeout(function () {
		// Coloca tu código de prueba aquí
		console.log('Espera completada.');
		done(); // Asegúrate de llamar a done() para indicar que la prueba ha finalizado.
	  }, 500); 
	});
  });
});

/* beforeEach(() => { Bicicleta.allBicis = []; })


describe('Bicicleta.allBicis', () => {
    it('Comienza vacía', () => {
        expect(Bicicleta.allBicis.length).toBe(0);
    })
})

describe('Bicicleta.add', () => {
    it('Agregamos una', () => {
        expect(Bicicleta.allBicis.length).toBe(0);
        
        var a = new Bicicleta(1, 'rojo', 'urbana', [-34.6012424,-58.3861497]);
        Bicicleta.add(a);

        expect(Bicicleta.allBicis.length).toBe(1);
        expect(Bicicleta.allBicis[0]).toBe(a);
    })
})

describe('Bicicleta.findById', () => {
    it('debe devolver la bici con id 1', () => {
        expect(Bicicleta.allBicis.length).toBe(0);

        var a = new Bicicleta(1, 'rojo', 'urbana', [-34.6012424,-58.3861497]);
        var b = new Bicicleta(2, 'blanca', 'urbana', [-34.596932,-58.3808287]);

        Bicicleta.add(a);
        Bicicleta.add(b);

        var targetBici = Bicicleta.findById(1);
        expect(targetBici.id).toBe(1);
        expect(targetBici.color).toBe(a.color);
        expect(targetBici.modelo).toBe(a.modelo);
    })
}) */
