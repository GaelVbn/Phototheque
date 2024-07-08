const Album = require('../models/Album');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const albums = async (req, res) => {
    try {
        const albums = await Album.find();
        console.log(albums);
        res.render('albums', { title: 'Mes albums', albums });
    } catch (error) {
        console.error('Erreur lors de la récupération des albums:', error);
        res.status(500).send('Erreur lors de la récupération des albums');
    }
}

const album = async (req, res) => {
    try {
        const idAlbum = req.params.id;
        const album = await Album.findById(idAlbum);
        if (!album) {
            return res.status(404).send('Album non trouvé');
        }

        res.render('album', { 
            title: `Mon Album ${album.title}`, 
            album, 
            errors: req.flash('error') 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'album:', error);
        res.redirect('/404');
    }
}

const addImage = async (req, res) => {
    try {
        const idAlbum = req.params.id;
        const album = await Album.findById(idAlbum);

        console.log(req.files);

        if (!req?.files?.image) {
            req.flash('errors', 'Veuillez ajouter une image');
            return res.redirect(`/albums/${idAlbum}`);
        }

        const image = req.files.image;

        if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
            req.flash('errors', 'jpg et png uniquement');
            return res.redirect(`/albums/${idAlbum}`);
        }

        const folderPath = path.join(__dirname, '../public/uploads', idAlbum);
        fs.mkdirSync(folderPath, { recursive: true });

        const imageName = image.name;
        const localPath = path.join(folderPath, imageName);
        await image.mv(localPath);

        album.images.push(imageName);
        await album.save();

        res.redirect(`/albums/${idAlbum}`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'image:', error);
        req.flash('errors', 'Une erreur est survenue lors de l\'ajout de l\'image');
        res.redirect(`/albums/${idAlbum}`);
    }
}

const createAlbumForm = (req, res) => {
    res.render('new-album', { title: 'Nouvel album', errors: req.flash('errors') });
}

const createAlbum = async (req, res) => {
    try {
        if (!req.body.albumTitle) {
            req.flash('errors', 'Le titre de l\'album est obligatoire');
            return res.redirect('/albums/create');
        }
        await Album.create({
            title: req.body.albumTitle,
        });
        res.redirect('/albums');
    } catch (error) {
        console.error('Erreur lors de la création de l\'album:', error);
        req.flash('errors', 'Une erreur est survenue lors de la création de l\'album');
        res.redirect('/albums/create');
    }
}

const deleteImage = async (req, res) => {
    try {
        const idAlbum = req.params.id;
        const album = await Album.findById(idAlbum);
        const imageIndex = req.params.imageIndex;
        const image = album.images[imageIndex];
        if (!image) {
            return res.redirect(`/albums/${idAlbum}`);
        }

        album.images.splice(imageIndex, 1);
        await album.save();

        const imagePath = path.join(__dirname, '../public/uploads', idAlbum, image);
        fs.unlinkSync(imagePath);

        res.redirect(`/albums/${idAlbum}`);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
        res.status(500).send('Erreur lors de la suppression de l\'image');
    }
}

const deleteAlbum = async (req, res) => {
    try {
        const idAlbum = req.params.id;
        await Album.findByIdAndDelete(idAlbum);
        
        const albumPath = path.join(__dirname, '../public/uploads', idAlbum);
        await rimraf(albumPath);
        
        if (!result) {
            console.error('Erreur lors de la suppression du dossier de l\'album');
            return res.status(500).send('Erreur lors de la suppression du dossier de l\'album');
        }

        res.redirect('/albums');
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'album:', error);
        res.status(500).send('Erreur lors de la suppression de l\'album');
    }
}



module.exports = { 
    deleteAlbum,
    deleteImage,
    addImage,
    album,
    albums,
    createAlbumForm,
    createAlbum,
}
