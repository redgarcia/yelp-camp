var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");
const fuzzysort = require("fuzzysort");

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyBqVVd31RUXNVrIVHpPa_cTg4-Ti5oeEaU',
    formatter: null
};

var geocoder = NodeGeocoder(options);

// ============================
//  CAMPGROUNDS ROUTES
// ============================


//DISPLAY ALL CAMPGROUNDS
router.get("/", function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var results;
    var allCampgrounds = [];

    if (req.query.search) {
        Campground.find({}, function (err, campgrounds) {
            results = fuzzysort.go(req.query.search, campgrounds, { keys: ["name", "author.username"] });

            if (results < 1) {
                req.flash('error', 'Cannot find campground');
                return res.redirect("back");
            } else {
                campgrounds = [];
                results.forEach(function (result) {
                    campgrounds.push(result.obj);
                });
                count = results.total;

                res.render("campgrounds/index", {
                    campgrounds: campgrounds,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                });
            }
        });
    } else {
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    req.flash("error", err.message);
                } else {

                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });

    }
});


//CREATE - add new campground
router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampGround = { name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng };
        Campground.create(newCampGround, function (err, data) {
            if (err) {
                req.flash("error", err.message);
            } else {
                res.redirect("/campgrounds");
            }
        });
    });
});

//SHOW - Display form to add another campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//SHOW - displays more info about one campground
router.get("/:id", function (req, res) {
    var campId = req.params.id;
    Campground.findById(req.params.id).populate("comments").exec(
        function (err, data) {
            if (err) {
                req.flash("error", err.message);
            } else {
                res.render("campgrounds/show", { campground: data });
            }
        });
});

//EDIT - show edit form for campground
router.get("/:id/edit", middleware.checkCampgroundPermission, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", err.message);
        } else {
            res.render("campgrounds/edit", { campground: campground });
        }
    });
});

//UPDATE - update the campground in the database
router.put("/:id", middleware.checkCampgroundPermission, function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }

        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Campground updated");
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });
});

//DESTROY - delete the campground
router.delete("/:id", middleware.checkCampgroundPermission, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;