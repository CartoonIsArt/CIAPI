module.exports = {
  "type": "mariadb",
  "host": process.env.MARIADB_HOST,
  "port": process.env.MARIADB_PORT,
  "username": process.env.MARIADB_USERNAME,
  "password": process.env.MARIADB_PASSWORD,
  "database": process.env.MARIADB_DATABASE,
  "synchronize": true,
  "logging": false,
  "extra": {
    "charset": "utf8mb4_unicode_ci"
  },
  "entities": [ 
    "src/entities/*.js"
  ],
  "cli": {
    "entitiesDir": "src/entities"
  }
}
