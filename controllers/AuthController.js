import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis'
import dbClient from '../utils/db';

class AuthController {
  // @desc Signs in a user by generating a new aut token
  // @route GET /connect
  // @access public
  static async getConnect (req, res) {
    // https://www.ibm.com/docs/en/cics-ts/5.4?topic=concepts-http-basic-authentication
    const authHeader = req.headers.authorization;
    const authToken = authHeader.split(' ')[1];
    const decodedAuthToken = Buffer.from(authToken, 'base64').toString('utf-8');
    const [ email, password ] = decodedAuthToken.split(':');

    const users = dbClient.db.collection('users');
    const existingUser = await users.findOne({ email });

    if (!existingUser || (existingUser.password != sha1(password))) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const token = uuidv4();
      const key = `auth_${token}`;

      const session = await redisClient.set(key, existingUser._id.toString(), 86400);
      res.status(200).json({ token: token });
    }
  }

  // @desc Signs out a user based on token
  // @route GET /disconnect
  // @access public
  static async getDisconnect (req, res) {
    const xToken = req.headers['x-token'];
    const key = `auth_${xToken}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized '});
    } else {
      await redisClient.del(key)
      res.status(204)
    }
  }
}

export default AuthController;
