const config = {
    SERVER: {
        PORT: 3000
    },
    DB: {
        HOSTNAME: 'db',
        NAME: process.env.POSTGRES_DB,
        USERNAME: process.env.POSTGRES_USER,
        PASSWORD: process.env.POSTGRES_PASSWORD,
        CONNECTION_RETRY_RATE: 5000
    }
};

module.exports = config;
