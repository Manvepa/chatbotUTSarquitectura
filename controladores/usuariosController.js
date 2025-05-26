const db = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Añade esta línea para exportar secretKey
exports.secretKey = 'chatbot';

// Register a new user
// Register a new user
exports.register = async (req, res) => {
  console.log("req.body: ", req.body);
  console.log("Nombre: ", req.body.nombres);
  console.log("email: ", req.body.correo);
  console.log("password: ", req.body.password);

  const nombres = req.body.nombres || '';
  const apellidos = req.body.apellidos || '';
  const edad = req.body.edad || 0;
  const cedula = req.body.cedula || '';
  const password = req.body.password;
  const correo = req.body.correo;
  const celular = req.body.celular || '';

  // Reviza si el email no ha sido creado
  const checkEmailQuery = 'SELECT * FROM usuariochat WHERE correo = $1';
  db.query(checkEmailQuery, [correo])
    .then(result => {
      if (result.rows.length > 0) {
        // If the email already exists, return an error message
        res.status(400).send('Email already exists');
      } else {
        // If the email does not exist, proceed with registering the new user
        bcrypt.hash(password, 10) // Hash the password
          .then(hashedPassword => {
            const query = 'INSERT INTO usuariochat (nombres, apellidos, edad, cedula, password, correo, celular, fechamod) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())';
            db.query(query, [nombres, apellidos, edad, cedula, hashedPassword, correo, celular])
              .then(() => {
                // Redirect the user to the chat page after logging in
                
                  res.redirect('/dashboard');
                
              })
              .catch(err => {
                if (err) throw err;
              });
          })
          .catch(err => {
            if (err) throw err;
          });
      }
    })
    .catch(err => {
      if (err) throw err;
    });
};

// Get a user by correo
exports.getUserByCorreo = (req, res) => {
  const { correo } = req.params;

  const query = 'SELECT * FROM usuariochat WHERE correo = $1';
  db.query(query, [correo])
    .then(result => {
      if (result.rows.length > 0) {
        res.send(result.rows[0]);
      } else {
        res.status(404).send('User not found');
      }
    })
    .catch(err => {
      if (err) throw err;
    });
};

// Update a user by id
exports.updateUser = (req, res) => {
  const { idChatUser } = req.params;
  const { nombres, apellidos, edad, cedula, password, correo, celular } = req.body;

  const query = 'UPDATE usuariochat SET nombres = $1, apellidos = $2, edad = $3, cedula = $4, password = $5, correo = $6, celular = $7, fecha_mod = NOW() WHERE id_chat_user = $8';
  db.query(query, [nombres, apellidos, edad, cedula, password, correo, celular, id_chat_user])
    .then(result => {
      if (result.rowCount > 0) {
        res.send('User updated successfully!');
      } else {
        res.status(404).send('User not found');
      }
    })
    .catch(err => {
      if (err) throw err;
    });
};

// Delete a user by id
exports.deleteUser = (req, res) => {
  const { idChatUser } = req.params;

  const query = 'DELETE FROM usuariochat WHERE idChatUser = ?';
  db.query(query, [idChatUser], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send('User deleted successfully!');
    } else {
      res.status(404).send('User not found');
    }
  });
};

// Login a user
// Login a user
exports.login = (req, res) => {
  const { correo, password } = req.body;

  const query = 'SELECT * FROM usuariochat WHERE correo = $1';
  db.query(query, [correo], (err, result) => {
    if (err) throw err;
    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare the provided password with the stored hash
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
        } else if (match) {
          // Utiliza la secretKey exportada
          const token = jwt.sign({ userId: user.idChatUser, correo: user.correo, userType: 'user' }, exports.secretKey, { expiresIn: '1h' });

          // Guarda el token en una cookie
          res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // maxAge en milisegundos (1 hora)

          // Redirige al usuario a la página de chat
          // res.redirect('/chat');
          res.status(200).json({ success: true });
        } else {
          res.status(401).json({ error: 'Invalid email or password' });
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
};



// Ruta protegida que verifica el token
exports.protectedRoute = (req, res, next) => {
  // Intenta obtener el token de la cookie llamada 'jwt'
  const token = req.cookies.jwt;

  if (!token) {
    // Si el token es inválido, redirige al usuario a la página de inicio de sesión
    res.redirect('/loginUsuario');
    return;
  }

  // Verifica el token
  jwt.verify(token, exports.secretKey, (err, decoded) => {
    if (err) {
      res.redirect('/accessChat');
    } else {
      // Adjunta la información del usuario decodificada a la solicitud para su procesamiento adicional en la ruta
      req.user = decoded;
      next(); // Continúa con el próximo middleware o manejador de ruta
    }
  });
};

// Comparar la contraseña encriptada con la contraseña proporcionada
exports.comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
}