'use strict'

var User = require('../models/user');
var Follow = require('../models/follow');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt')
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs');
var path = require('path');


function home(req, res) {
    res.status(200).send({
        message: 'Hola mundo'
    })
}

function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Acción de pruebas en el servidor'
    })
}

//registro de usuarios
function saveUser(req, res) {
    var params = req.body;
    var user = new User();
    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER'
        user.image = null

        //Controlar usuarios duplicados
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' });
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intenta registrar ya existe' })
            } else {
                //Cifra la contraseña y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' })
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        }
                    })
                })

            }
        })



    } else {
        res.status(200).send({
            message: 'Envía todos los campos necesarios!!'
        })
    }
}

//login de usuarios
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //devolver datos de usuario

                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {
                        user.password = undefined
                        return res.status(200).send({ user })
                    }


                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                }
            })
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar!!' });
        }
    })
}

//Consultar Usuario
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' })
        if (!user) return res.status(404).send({ message: 'El usuario no existe' })

        Follow.findOne({"user": req.user.sub, "followed": userId}).exec((err,follow)=>{
            if (err) return res.status(500).send({ message: 'Error al comprobar el seguimiento' });
        })

        return res.status(200).send({ user })
    });
}

//Devolver listado de usuarios paginados

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total / itemsPerPage)
        })
    });
}

//Edición para datos de usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tiene permisos para actualizar los datos de usuario' });
    }

    // al colocarle el tercer parametro {new:true}, se devuelve el objeto como quedo modificado, 
    // si no se coloca el parametro se devuelve el objeto como estaba antes de la modificación
    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

        return res.status(200).send({ user: userUpdated })
    })



}

function uploadImage(req, res){
    var userId = req.params.id;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tiene permiso para actualizar los datos de usuario' });
    }

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\')

        var file_name = file_split[2];

        var ext_split = file_name.split('\.')
        var file_ext = ext_split[1]

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tiene permiso para actualizar los datos de usuario');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ){

            User.findByIdAndUpdate(userId, {image:file_name}, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la petición' });
                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
        
                return res.status(200).send({ user: userUpdated })
            })
                           
        }else{
           return removeFilesOfUploads(res, file_path, 'Extensión no válida'); 
        }

    }else{
        return res.status(200).send({message: 'No se han subido imágenes'})
    }
}

function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path,(err)=>{
        return res.status(200).send({ message: message });
    });
}


function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/'+imageFile;
    fs.exists(path_file,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message:'No existe la imagen'});
        }
    })
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
}