var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// ============================
//  COMMENTS ROUTES
// ============================

//SHOW - Display the comment form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", err.message);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });
});

//CREATE - Saves the comment data into the database
router.post("/", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("succes", "Comment added");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//EDIT - Display the edit form for comments
router.get("/:comment_id/edit", middleware.checkCommentPermission, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, comment) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("comments/edit", { campground_id: req.params.id, comment: comment });
        }
    });
});

//UPDATE - Save the updated comment
router.put("/:comment_id", middleware.checkCommentPermission, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, comment) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success", "Comment updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DELETE - deletes the comment
router.delete("/:comment_id", middleware.checkCommentPermission, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;