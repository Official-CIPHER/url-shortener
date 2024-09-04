const express = require("express");
const path = require("path")

const cookieParser = require("cookie-parser")
// Middleware required
const {restrictToLoginUserOnly, checkAuth} = require("./middlewares/authMiddleware")


const {connectToMongoDB} = require("./connect")

const URL = require("./models/urlSchema")

// route require
const urlRoute = require("./routes/urlRoute")
const staticRoute = require("./routes/staticRouter")
const userRoute = require("./routes/userRoute");

const app = express();
const PORT = 9000;

// MongoDB Connections
connectToMongoDB('mongodb://127.0.0.1:27017/ShortURL').then(()=> console.log("MongoDB Connected !!")
).catch((err)=> console.log(`Error Occured in MongoDB : ${err}`)
)

// View Engine(EJS) Connections
app.set('view engine', 'ejs');
app.set('views',path.resolve('./views'))

// Middleware Connections
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

// Routes Connections
app.use("/url",restrictToLoginUserOnly, urlRoute);
app.use("/user", userRoute);


// Rendering Connections
app.use('/', checkAuth, staticRoute)

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now()
                    }
                }
            },
            { new: true }  // Ensure the updated document is returned
        );

        if (entry) {
            res.redirect(entry.redirectURL);
        } else {
            // Handle the case where the shortId is not found
            res.status(404).send("URL not found");
        }
    } catch (err) {
        // Handle any errors that occur during the operation
        console.error(err);
        res.status(500).send("Server error");
    }
});


// Server is Running at PORT
app.listen(PORT,()=>console.log(`Server Running !! at : ${PORT}`)
)