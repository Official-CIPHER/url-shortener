const express = require("express");
const URL = require("../models/urlSchema");

const router = express.Router();

// Existing GET route
router.get("/", async (req, res) => {
    try {
        if(!req.user) return res.redirect('/login')
        const allurls = await URL.find({ createBy :req.user._id }).exec();
        return res.render("home", {
            urls: allurls,
        });
    } catch (error) {
        console.error("Error fetching URLs:", error);
        return res.status(500).send("Server error");
    }
});

// DELETE route to remove a URL by its ID
router.delete("/url/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await URL.findByIdAndDelete(id); // Delete the URL by its ID
        res.status(200).json({ message: 'URL deleted successfully' });
    } catch (error) {
        console.error("Error deleting URL:", error);
        res.status(500).json({ message: 'Error deleting URL' });
    }
});

// Signup Page
router.get('/signup',(req,res)=>{
    return res.render('signup')
})

// Login Page
router.get('/login',(req,res)=>{
    return res.render('login')
})

module.exports = router;
