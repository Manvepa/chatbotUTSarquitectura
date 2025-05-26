// Importamos la base de datos de PostgreSQL
const pg = require('pg');
// Importamos las variables de entorno
const {config} = require('dotenv')

// Agregamos los métodos de dotenv
config()

// Configuración de la conexión a la base de datos
const connection = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos PostgreSQL establecida');
});

module.exports = connection;
