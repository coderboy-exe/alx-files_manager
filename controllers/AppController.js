import redisClient from '../utils/redis';
import dbClient from '../utils/db';


class AppController {
  //@desc Get Redis client status
  //@route GET /status
  //@access public
  static getStatus(req, res) {
    res.status(200).send({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  //@desc Get DB client stats
  //@route GET /stats
  //@access public
  static getStats(req, res) {
    res.status(200).send({
      users: dbClient.nbUsers(),
      db: dbClient.nbFiles(),
    });    
  }
}

export default AppController;
