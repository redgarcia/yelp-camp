var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

//test data
var data = [
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1259&q=80",
        description: "Normally, both your asses would be dead as fucking fried chicken, but you happen to pull this shit while I'm in a transitional period so I don't wanna kill you, I wanna help you. But I can't give you this case, it don't belong to me. Besides, I've already been through too much shit this morning over this case to hand it over to your dumb ass"
    },
    {
        name: "Desert Mesa",
        image: "https://images.unsplash.com/photo-1500581276021-a4bbcd0050c5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        description: "Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows."
    },
    {
        name: "Canyon Floor",
        image: "https://images.unsplash.com/photo-1535576434247-e0f50b766399?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1055&q=80",
        description: "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit?"
    }
]

function seedDB() {
    //Removes all Campgrounds
    Campground.remove({}, function (err) {
        if (err) {
            console.log();
        }

        //Add test campgrounds
        data.forEach(function (seed) {
            Campground.create(seed, function (err, campground) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Campground added!");
                    Comment.create({
                        text: "This place is great, but I wish there was internet",
                        author: "Homer"
                    },
                        function (err, comment) {
                            campground.comments.push(comment);
                            campground.save();
                            console.log("Created new comment");
                        });
                }
            });
        });
        console.log("Campgrounds has been removed!");
    });
}

module.exports = seedDB;