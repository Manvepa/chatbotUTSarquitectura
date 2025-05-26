// Método para iniciar sesión
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { secretKey } = require('./usuariosController.js');


const generateToken = (user, result) => {
  const payload = {
    id: user.id,
    userType: 'admin',
    expiresIn: '1h'
  };


  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};


// Método para iniciar sesión
exports.login = (req, res) => {
  const { nombreCuenta, password } = req.body;

  // Query for PostgreSQL
  const query = 'SELECT * FROM administrador WHERE nombreCuenta = $1 AND password = $2';
  db.query(query, [nombreCuenta, password], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.redirect('/loginAdministrador');
      return;
    }

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = generateToken(user); // Aquí se pasa el usuario a la función generateToken
      res.cookie('jwt', token, { httpOnly: true });
      res.redirect('/dashboard');
    } else {
      res.redirect('/loginAdministrador');
    }
  });
};

// Método para obtener la lista de usuarios
exports.getUsuarios = (req, res) => {
  // Query for PostgreSQL
  const query = 'SELECT * FROM usuariochat';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.json({ error: 'Error while fetching users' });
      return;
    }
    res.json(result.rows);
  });
};

// Método para editar un usuario
exports.editarUsuario = async (req, res) => {
  const id = req.params.id;
  const { nombres, apellidos, edad, cedula, correo, password, celular } = req.body;

  if (password) {
    // Si se proporciona una contraseña nueva, encriptarla
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
  }

  // Query for PostgreSQL
  const query = 'UPDATE usuariochat SET nombres = $1, apellidos = $2, edad = $3, cedula = $4, correo = $5, password = $6, celular = $7 WHERE idChatUser = $8';
  db.query(query, [nombres, apellidos, edad, cedula, correo, password || req.body.password, celular, id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error while editing user' });
      return;
    }

    if (result.rowCount > 0) {
      res.redirect('/dashboard');
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
};

// Función para actualizar un usuario
const actualizarUsuario = (req, res) => {
  const usuarioId = req.params.id;
  const { nombres, apellidos, edad, cedula, correo, password, celular } = req.body;

  // Query for PostgreSQL
  const query = 'UPDATE usuariochat SET nombres = $1, apellidos = $2, edad = $3, cedula = $4, correo = $5, password = $6, celular = $7 WHERE idChatUser = $8';
  db.query(query, [nombres, apellidos, edad, cedula, correo, password, celular, usuarioId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error while updating user' });
      return;
    }

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
};

// Función para eliminar al usuario
// Función para eliminar al usuario
exports.eliminarUsuario = (req, res) => {
  const usuarioId = parseInt(req.params.id, 10);

  if (isNaN(usuarioId)) {
    // If the id is not a number, return a 400 Bad Request error
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  // Query for PostgreSQL
  const query = 'DELETE FROM usuariochat WHERE idChatUser = $1';
  db.query(query, [usuarioId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error while deleting user' });
      return;
    }

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
};

// Función para obtener el id del usuario
exports.getUsuarioById = (req, res) => {
  const id = req.params.id;

  // Query for PostgreSQL
  const query = 'SELECT * FROM usuariochat WHERE idChatUser = $1';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error while getting user by id' });
      return;
    }

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
};

// Función para actual un usuario
constizarUsuario = (req, res) => {
  const usuarioId = req.params.id;
  const { nombres, apellidos, edad, cedula, correo, password, celular } = req.body;

  const query = 'UPDATE usuariochat SET ? WHERE idChatUser = ?';
  db.query(query, [{ nombres, apellidos, edad, cedula, correo, password, celular }, usuarioId], (err, result) => {
    if (err) {
      // Si hay un error, devolver una respuesta de error en formato JSON
      res.status(500).json({ error: 'Error al editar el usuario' });
      return;
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
};

// Exportar la función
exports.actualizarUsuario = actualizarUsuario;

// Agrega esta línea al final del archivo
exports.actualizarUsuarioClient = actualizarUsuario;