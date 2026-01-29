const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dpjqreebb",
    api_key: "963111292145888",
    api_secret: "ySOyiRdXQ3T4TSwfeo3eY2gsB3o"
});

module.exports = cloudinary;
