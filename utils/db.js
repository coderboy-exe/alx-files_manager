import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const URL = `mongodb://${DB_HOST}:${DB_PORT}/${DATABASE}`;
    this.client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect()
      .then(() => {
        this.db = this.client.db(`${DATABASE}`);
      })
      .catch((err) => { console.log(err); });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const docs = await this.db.collection('users').countDocuments();
    return docs;
  }

  async nbFiles() {
    const files = await this.db.collection('files').countDocuments();
    return files;
  }
}

const dbClient = new DBClient();

export default dbClient;
