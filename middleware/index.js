var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

//check if user can edit or delete the campground
middlewareObj.checkCampgroundPermission = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, campground) {
            if (err || !campground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if (campground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("back");
    }
}

//check if user can edit or delete the comment
middlewareObj.checkCommentPermission = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err || !comment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                if (comment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login first");
        res.redirect("back");
    }
}

//check if user is logged in and allowed to add a campground or comment
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
}

module.exports = middlewareObj;