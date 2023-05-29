import { MongoClient } from 'mongodb';


const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const URL = `mongodb://${HOST}:${PORT}/${DATABASE}`;
    this.client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect()
      .then(() => {console.log('Connected to MongoDB database')})
      .catch((err) => {console.log(err)})
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const docs = await this.client.db(this.database).collection('users').countDocuments();
    return docs
  }

  async nbFiles() {
    const files = await this.client.db(this.database).collection('files').countDocuments();
    return files
  }
}


const dbClient = new DBClient();

export default dbClient;
