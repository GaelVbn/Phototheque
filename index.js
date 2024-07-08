const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const albumRoutes = require('./routes/album.routes');
const app = express();


mongoose.connect('mongodb+srv://gaelvanbeveren98:Unkut59210@myfirstdatabase.otymanr.mongodb.net/phototheque');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));



app.set('trust proxy', 1);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());

app.get('/' , (req, res) => {
    res.redirect('/album');
});

app.get('/', (req, res) => {
    res.render('album', { title: 'Album' });
});

app.use('/', albumRoutes);

app.use((req, res) => {
    res.status(404).send('Not found');
})


app.listen(3000, () => console.log('Listening on port 3000'));