var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
// ============================
//  AUTH ROUTES
// ============================
var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
    res.render("landing");
});

//REGISTER
router.get("/register", function (req, res) {
    res.render("register", { page: "register" });
});

router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN
router.get("/login", function (req, res) {
    res.render("login", { page: "login" });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true
}));

//LOGOUT
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/campgrounds");
});

module.exports = router;