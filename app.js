const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// Crear un servidor HTTP utilizando Express
const server = require('http').createServer(app);
// Configurar Socket.io para la comunicación en tiempo real
const io = require('socket.io')(server);
//Importamos toda la lógica del ChatBot
const chatModule = require('./logicaBot/ChatModule.js');
// Importamos el controlador de Usuarios
const usuariosController = require('./controladores/usuariosController.js');
// Importamos el controlador de Administrador
const administradorController = require('./controladores/administradorController.js')
// Actualizamos usuario
const { actualizarUsuarioClient } = require('./controladores/administradorController.js');
// Importa la variable secretKey desde usuariosController.js
const { secretKey } = require('./controladores/usuariosController');
// Agrego las cookies
const cookieParser = require('cookie-parser');
// Agrego la session de adm
const cookieSession = require('cookie-session');
const jwt = require('jsonwebtoken');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware de cookie-session
app.use(cookieSession({
    secret: secretKey, // Usa la misma clave secreta que en jwt
    maxAge: 3600000 // Tiempo de vida de la cookie en milisegundos (1 hora en este caso)
}));

function verifyTokenFromCookie(req, res, next) {
    const token = req.cookies.jwt;
  
    if (!token) {
      return res.redirect('/accessChat');
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid token.');
      }
  
      req.adminId = decoded.adminId;
      next();
    });
  }

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid token.');
    }

    req.adminId = decoded.adminId;
    next();
  });
}

// Verificar Usuario o administrador
function verifyUserType(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid token.');
      }

      req.userType = decoded.userType; // Agrega userType al objeto de solicitud

      // Comprobar si el usuario es 'user' o 'admin'
      if (req.userType === 'user' || req.userType === 'admin') {
        next();
      } else {
        res.status(403).send('Forbidden. You are not an administrator nor a regular user.');
      }
    });
}

// Configurar el middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static('public'));
// Middleware de las cookies
app.use(cookieParser());

// Configurar la ruta principal para servir un archivo HTML (interfaz de chat)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/interface/index.html');
});

app.get('/accessChat',  (req, res) => {
    res.sendFile(__dirname + '/interface/accessChat.html');
});

// Configurar la ruta principal para servir un archivo HTML (interfaz de chat)
app.get('/chat', verifyTokenFromCookie, verifyUserType, (req, res) => {
    if (req.userType !== 'user') {
      return res.redirect('/accessChat');
    }
    res.sendFile(__dirname + '/interface/chat/chat.html');
  });

// Configurar la ruta principal para servir un archivo HTML (interfaz de chat)
app.get('/loginUsuario', (req, res) => {
    res.sendFile(__dirname + '/interface/usuario/loginUsuario.html');
});

// Configurar la ruta principal para servir un archivo HTML (interfaz de chat)
app.get('/loginAdministrador', (req, res) => {
    res.sendFile(__dirname + '/interface/administrador/loginAdministrador.html');
});

// Configurar la ruta principal para servir un archivo HTML (interfaz de chat)

app.get('/registrarUsuario', (req, res) => {
  res.sendFile(__dirname + '/interface/usuario/registrarUsuario.html');

});



// Configurar la ruta principal de administrador (interfaz de Administrador)
app.get('/registrarUsuariosAdm', verifyTokenFromCookie, verifyUserType, (req, res) => {
  if (req.userType !== 'admin') {
    return res.redirect('/accessChat');
  }
    res.sendFile(__dirname + '/interface/administrador/crud/registrarUsuarios.html');
}); 

// Configurar editar usuario(interfaz de Administrador)
app.get('/editarUsuarios', verifyTokenFromCookie, verifyUserType, (req, res) => {
  if (req.userType !== 'admin') {
    return res.redirect('/accessChat');
  }
    res.sendFile(__dirname + '/interface/administrador/crud/editarUsuarios.html');
}); 

// Configurar la ruta principal para el administrador
app.get('/dashboard', verifyTokenFromCookie, verifyUserType, (req, res) => {
    if (req.userType !== 'admin') {
      return res.redirect('/accessChat');
    }
    res.sendFile(__dirname + '/interface/administrador/dashboard.html' )
  });


// Ruta para editar usuario
app.get('/api/editarUsuarios/:id', administradorController.getUsuarioById);

// Ruta para ver los usuarios a editar
// Ruta para obtener la lista de usuarios
app.get('/api/usuarios', administradorController.getUsuarios);

app.get('/eliminarUsuarios', verifyTokenFromCookie, verifyUserType, (req, res) => {
  if (req.userType !== 'admin') {
    return res.redirect('/accessChat');
  }
    res.sendFile(__dirname + '/interface/administrador/crud/eliminarUsuarios.html');
});

// Api para editar usuarios
app.post('/api/editarUsuarios', (req, res) => administradorController.editarUsuario(req, res));

// Ruta para los registrados
app.post('/register', usuariosController.register);

// Ruta para los registrados
app.post('/registrarUsuarios', usuariosController.register);

// Función para actualizar un usuario
app.put('/api/usuario/:id', administradorController.actualizarUsuario);

// Función para actualizar un usuario
app.put('/api/usuario/:id', actualizarUsuarioClient);

// Ruta para los usuarios logeados
app.post('/login', usuariosController.login);

// Ruta para los administradores logeados
app.post('/loginAdm', administradorController.login);

// Ruta para editar usuario
app.get('/api/usuarios/:id', administradorController.getUsuarioById);

app.delete('/api/usuarios/:id', administradorController.eliminarUsuario);

// Manejar eventos de conexión y desconexión de clientes a través de Socket.io
io.on('connection', chatModule.handleConnection);

// Iniciar el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});