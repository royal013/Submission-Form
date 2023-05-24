require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/schema");
const bcrypt = require("bcryptjs");
require("./db/connection");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

app.use(express());
app.use(cookieParser()); //we are using this
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;




const tempalte_path = path.join(__dirname, "../template/views");
const partial_path = path.join(__dirname, "../template/partials");

hbs.registerPartials(partial_path);
app.set("view engine", "hbs");
app.set("views", tempalte_path);

app.get("/", (req, res) => {
    res.render("index");
})
app.get("/secret", auth, (req, res) => {
    // console.log(`his is the cookie - ${req.cookies.jwt}`);

    res.render("secret");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/logout", auth, async (req, res) => {
    try {

        // for single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token;

        // })

        // for all device  logout
        req.user.tokens=[];


        res.clearCookie("jwt"); // This will delete the cookie
        console.log("logout successfully."); 
        await req.user.save();
        res.render("login");

    } catch (error) {
        res.status(500).send(error);

    }
})
app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        if (password === confirmpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                age: req.body.age,
                email: req.body.email,
                gender: req.body.gender,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            })


            // token
            console.log("The success part is: " + registerEmployee);
            const token = await registerEmployee.generateToken();
            console.log("The token part is: " + token);

            //cookie part
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            });
            console.log(cookie);




            // password hash

            const data = await registerEmployee.save();  //This line will save this data to the database
            res.status(201).render("index.hbs");


        }
        else {
            res.send("password donot match.")

        }
    } catch (error) {
        res.status(404).send(error);
    }
})

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await Register.findOne({ email: email });//This line will check if this email is contain in our database or not

        const isMatch = await bcrypt.compare(password, userEmail.password);

        const token = await userEmail.generateToken();
        console.log("The token part is: " + token);

        //cookie part
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            // secure:true   cookie will only work on https
        });





        // res.send(userEmail.password);
        if (isMatch) {
            res.render("index");

        }
        else {
            res.send("Invalid credintals");
        }

    } catch (error) {
        res.status(400).send("Invalid email");

    }
})


// const bcrypt=require("bcryptjs");

// const securePassword=async(password)=>{
//     const passwordHash=await bcrypt.hash(password,10);
//     console.log(passwordHash);
// }

// securePassword("royal@123");











app.listen(port, () => {
    console.log(`listening at port nubmer ${port}`);
})