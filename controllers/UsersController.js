import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  // @desc Posts a new user to the db
  // @route POST /users
  // @access public
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    } else if (!password) {
      res.status(400).json({ error: 'Missing password' });
    }

    const users = dbClient.db.collection('users');
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Already exist' });
    } else {
      const hashedPwd = sha1(password);
      const newUser = await users.insertOne({
        email,
        password: hashedPwd,
      });
      if (newUser) {
        res.status(201).send({
          id: newUser.insertedId,
          email,
        });
      }
    }
  }
}

export default UsersController;
