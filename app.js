require('newrelic');
require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("./config/passport");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const MongoDBStore = require("connect-mongodb-session")(session);

const Usuario = require("./models/usuario");
const Token = require("./models/token");

var indexRouter = require("./routes/index");
var usuariosRouter = require("./routes/usuarios");
var tokenRouter = require("./routes/token");
var bicicletasRouter = require("./routes/bicicletas");

var authAPIRouter = require("./routes/api/auth");
var bicicletasAPIRouter = require("./routes/api/bicicletas");
var usuariosAPIRouter = require("./routes/api/usuarios");

let app = express();

let store;
if (process.env.NODE_ENV === "development") {
    store = new session.MemoryStore();
} else {
    store = new MongoDBStore({
        uri: process.env.MONGO_URI,
        collection: "sessions",
    });
    store.on("error", function (error) {
        assert.ifError(error);
        assert.ok(false);
    });
}

app.set("secretKey", "red_biciclita_!!!!!.**1121324");
app.use(
    session({
        cookie: { maxAge: 240 * 60 * 60 * 1000 },
        store: store,
        saveUninitialized: true,
        resave: "true",
        secret: "red_biciclita_!!!!!.**",
    })
);

var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/usuario", usuariosRouter);
app.use("/token", tokenRouter);
app.use("/bicicletas", loggedIn, bicicletasRouter);
// Routes API
app.use("/api/auth", authAPIRouter);
app.use("/api/bicicletas", validarUsuario, bicicletasAPIRouter);
app.use("/api/usuarios", validarUsuario, usuariosAPIRouter);

app.use("/privacy_policy", function (req, res) {
    res.sendFile("public/privacy_policy.html");
});
app.use("/google442b1549502a69ae", function (req, res) {
    res.sendFile("public/google442b1549502a69ae.html");
});

app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
        ],
    })
);
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/error",
    })
);

//Login
app.get("/login", function (req, res) {
    res.render("session/login");
});

app.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, usuario, info) {
        if (err) return next(err);
        if (!usuario) return res.render("session/login", { info });
        req.logIn(usuario, function (err) {
            if (err) return next(err);
            return res.render("index", {  title: 'Express', isLoggedIn: true });
        });
    })(req, res, next);
});

app.get("/logout", function (req, res) {
    req.logOut();
    return res.render("index", { title: 'Express', isLoggedIn: false });
});

app.get("/forgotPassword", function (req, res) {
    res.render("session/forgotPassword");
});

app.post("/forgotPassword", async (req, res) => {
    try {
        var usuario = await Usuario.findOne({ email: req.body.email });
        if (!usuario)
            return res.render("session/forgotPassword", {
                info: { message: "No existe email para un usuario existente." },
            });

        await usuario.resetPassword(function (err) {
            if (err) return next(err);
        });

        res.render("session/forgotPasswordMessage");
    } catch (err) {
        console.log("session/forgotPasswordMessage");
    }
});

app.get("/resetPassword/:token", async function (req, res, next) {
    try {
        var token = await Token.findOne({ token: req.params.token });
        if (!token) {
            return res.status(400).send({
                type: "not-verified",
                msg: "No exite usuario asociado al token. Verifique que su token no haya expirado.",
            });
        }

        var usuario = await Usuario.findById(token._userId);
        if (!usuario) {
            return res
                .status(400)
                .send({ msg: "No existe usuario asociado al token." });
        }

        res.render("session/resetPassword", {
            errors: {},
            usuario: usuario,
        });
    } catch (err) {}
});

app.post("/resetPassword", async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        res.render("session/resetPassword", {
            errors: {
                confirm_password: {
                    message: "No coninciden con el password ingresado",
                },
            },
            usuario: new Usuario({ email: req.body.email }),
        });
    }
    try {
        var usuario = await Usuario.findOne({ email: req.body.email });
        usuario.password = req.body.password;
        await usuario.save();
        res.redirect("/login");
    } catch (err) {
        res.render("session/resetPassword", {
            errors: err.errors,
            usuario: new Usuario({ email: req.body.email }),
        });
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        console.log("Usuario sin loguearse.");
        res.redirect("/login");
    }
}

function validarUsuario(req, res, next) {
    jwt.verify(
        req.headers["x-access-token"],
        req.app.get("secretKey"),
        function (err, decoded) {
            if (err) {
                res.json({ status: "error", message: err.message, data: null });
            } else {
                req.body.userId = decoded.id;
                console.log("jwt verify: " + decoded);
                next();
            }
        }
    );
}

module.exports = app;
