'use strict'

var mongoose = require('mongoose')
var app = require('./app')
var port = 3800;
//Conexion base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://admin:admin@ds121622.mlab.com:21622/mean_social', { useMongoClient: true }).then(() => {
    console.log("la conexión a la base de datos se ha realizado exitosamente")
    //crear servidor
    app.listen(port,()=>{
        console.log("Servidor corriendo en http://localhost:3800")
    })
}).catch(err => console.log(err))