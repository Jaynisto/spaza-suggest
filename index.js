import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
// import ShortUniqueId from 'short-unique-id';
import db from './database/connectionString.js';
import factoryFunction from "./spaza-suggest.js";

let app = express()
let sendOrGetData = factoryFunction(db);
// const uniqueId = new ShortUniqueId({ length: 5 });

//Configuring Handlebars
const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');
app.use(express.static("public"));

//Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session
app.use(session({
    secret: 'codeforgeek',
    resave: true,
    saveUninitialized: true
}));

// Flash
app.use(flash());

app.get('/', (req,res)=>{
    res.render("index")
})

app.get('/clientReg', (req, res) => {
    res.render("clientReg")
})

app.get('/ownerSignIn', async (req, res) => {
    const places = await sendOrGetData.areas();
    res.render("ownerSignIn", {
        places
    })
})

app.post('/clientReg', async(req, res) => {
    const { username } = req.body;
    if(username){
        await sendOrGetData.registerClient(username)
        const checkingUserCode = await sendOrGetData.codeForExistingUsers(username)
        req.flash('success', "Your Code is to log in ", checkingUserCode)
    }
    res.render("clientReg")
});

app.post('/ownerSignIn', async(req, res) => {
    const { ownername, spaza } = req.body;
    if(ownername){
        await sendOrGetData.registerSpaza(ownername, spaza)
        const checkingUserCode = await sendOrGetData.codeForExistingSpaza(ownername)
        req.flash('success', "Your Code is to log in ", checkingUserCode)
    }
    res.render("ownerSignIn")
});


app.get('/clients/:username', async (req, res) => {
    const { username } = req.params; 
    const names = await sendOrGetData.areas()
    res.render("suggestions", {
        names,
        username
    })
})

app.get('/owner/:spaza', async (req, res) => {
    const { spaza } = req.params; 
    console.log(spaza)
    res.render("spaz", {
       spaza 
    })
})

app.post('/owner/:spaza', async (req, res) => {
    const { spaza } = req.params;
    const { checked } = req.body;
    const clientId = await sendOrGetData.ownerId(spaza)
    
    if(spaza){
        await sendOrGetData.registerSpaza(spaza, clientId,)
        req.flash('success', 'Entry Added');
    }
    else{
        req.flash('error', 'Select product name & area');
    }
    // const userDetails = await sendOrGetData.waitersDays(names, days);
    res.redirect("/owner/" + spaza)
})
app.get('/ownerLohgIn', (req,res)=>{
    res.render("ownerLohgIn")
})

app.post('/ownerLohgIn', async (req, res)=>{
    const { pascode } = req.body;
    if(pascode){
        const user = await sendOrGetData.spazaLogin(pascode);
        if(user) {
            req.session.user = user;
            res.redirect(`owner/${user.username}`)
            return;
        }else{
            res.redirect("/ownerSignIn")
        }
    }
    else{
        res.redirect("/ownerLohgIn")
    }
})


app.post('/clients/:username', async (req, res) => {
    const { username } = req.params;
    const { area , pname} = req.body;
    const clientId = await sendOrGetData.userId(username)
    
    if(username && area){
        await sendOrGetData.suggestProduct(area, clientId, pname)
        req.flash('success', 'Entry Added');
    }
    else{
        req.flash('error', 'Select product name & area');
    }
    // const userDetails = await sendOrGetData.waitersDays(names, days);
    res.redirect("/clients/" + username)
})

app.get('/clientLogin', (req, res) => {
    res.render("clientLogin")
})

app.post('/clientLogin', async (req, res) => {
    const { code } = req.body;
    if(code){
        const user = await sendOrGetData.clientLogin(code);
        if(user) {
            req.session.user = user;
            res.redirect(`clients/${user.username}`)
            return;
        }else{
            res.redirect("/clientReg")
        }
    }
    else{
        res.redirect("/clientLogin")
    }

})




const PORT = process.env.PORT || 3032;
app.listen(PORT, (req, res) => {
    console.log("Application Fired On " + PORT + "!")
});