import pgPromise from 'pg-promise';
const pgp = pgPromise({});

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:Jnisto9801@localhost:5432/spaza_suggest"
const config ={  
    connectionString : DATABASE_URL
}
if(process.env.NODE_ENV == 'production'){
    config.ssl ={
        rejectUnauthorized: false
    }
}


 const db = pgp(config);
 export default db;


