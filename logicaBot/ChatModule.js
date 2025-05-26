// chatModule.js
// Crear una interfaz de línea de comandos para el usuario
const readline = require('readline');
// Llamamos al bot
const botModule = require('./botModule');

// Esta función maneja la conexión del usuario al socket
const handleConnection = (socket) => {
    console.log('A user connected');

    // Manejar eventos de mensajes de chat desde el cliente
    socket.on('chat message', async (msg) => {
        try {
            // Obtener una respuesta del bot de RiveScript basada en el mensaje del usuario
            const output = await botModule.replyToMessage(msg);
            // Emitir mensajes al cliente para actualizar la interfaz de chat
            
            socket.emit('chat message', { user: 'Human:', message: msg });
            botModule.handleBotOutput(output, socket, msg);
        } catch (err) {
            console.error(err);
        }
    });
    // Manejar eventos de desconexión de clientes
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
};

module.exports = {
    handleConnection,
};
