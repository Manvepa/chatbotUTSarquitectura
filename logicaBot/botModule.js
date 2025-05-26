// botModule.js

// Importar la biblioteca RiveScript para la creación del bot de chat
const RiveScript = require('rivescript');
//Importamos la base de datos
const connection = require('../db/db');
// Importar la biblioteca chalk para dar formato a los mensajes en la consola
const chalk = require('chalk');

//Pasamos el formato utf8 a nuestro bot
const bot = new RiveScript({ utf8: true });

// Cargar los archivos de conocimiento del bot desde el directorio "brain"
bot.loadDirectory("brain", loading_done, loading_error);

// Función llamada cuando la carga del conocimiento del bot está completa
function loading_done() {
    console.log(chalk.yellow("Inicio Chat"));
    bot.sortReplies();
}

// Función llamada en caso de error durante la carga del conocimiento del bot
function loading_error(err) {
    console.log(err);
}

// Esta función maneja la respuesta del bot a un mensaje del usuario
const replyToMessage = async (msg) => {
    return await bot.reply('local-user', msg);

};

// Esta función maneja la salida del bot y realiza acciones según la respuesta
const handleBotOutput = (output, socket, mensajeUsuario) => {
    const outputLines = output.split('\n');
    let n = 0;

    outputLines.forEach((line) => {
        n++;
        if (n === 1) {
            socket.emit('chat message', { user: "<strong> Maria </strong>", message: output });

            const respuesta = output;
            console.log("Bot: " + respuesta);

            if (respuesta.includes("Feliz")) {
                const fechaHora = new Date().toISOString().slice(0, 19).replace('T', ' ');

                console.log("si esta \n", respuesta, fechaHora);

                // Agregando datos de Respuesta del ChatBot en la base de datos
                const insertQuery = 'INSERT INTO ayudas (mensajeuser, repuestaChat, fechaAyuda) VALUES ($1, $2, $3)';
                connection.query(insertQuery, [mensajeUsuario, respuesta, fechaHora], (err, result) => {
                    if (err) {
                        console.error('Error al insertar mensaje en la base de datos:', err);
                        return;
                    }
                    console.log('Mensaje almacenado en la base de datos');
                });
            } else {
                console.log("no esta");
            }
        } else {
            // Emitir mensajes al cliente para actualizar la interfaz de chat
            socket.emit('chat message', { user: " ", message: line });
        }
    });
};

// Este bloque de código exporta las funciones replyToMessage y handleBotOutput
// desde el módulo botModule para que puedan ser utilizadas en otros archivos.
module.exports = {
    // La función replyToMessage maneja la respuesta del bot a un mensaje del usuario.
    replyToMessage,
    // La función handleBotOutput maneja la salida del bot y realiza acciones adicionales según la respuesta.
    handleBotOutput,
};
