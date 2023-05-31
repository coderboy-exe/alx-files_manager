import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import UsersController from './UsersController';

class FilesController {
  static async postUpload(req, res) {
    // const user = await UsersController.getMe(req, res);
    // const { id: userId, email } = user;
    const token = req.headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    const { name, type, parentId, isPublic = false, data } = req.body;

    if (!name) {
     return res.status(400).json({ error: 'Missing name' });
    }
    if (type !== 'folder' && type !== 'file' && type !== 'image') {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    const files = dbClient.db.collection('files')
    if (parentId) {
      const parentDir = await files.findOne({ _id: ObjectId(parentId) });
      if (!parentDir) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentDir.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      const newFile = await files.insertOne(
        {
          userId: ObjectId(userId),
          name,
          type,
          parentId: parentId ? ObjectId(parentId) : 0,
          isPublic: isPublic
	}
      )
      const file = await files.findOne({ _id: newFile.insertedId });
      
        return res.status(201).send({
          id: newFile.insertedId,
          userId: file.userId,
          name: file.name,
          type: file.type,
          isPublic: file.isPublic,
          parentId: file.parentId,
        });
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filePath = path.join(folderPath, uuidv4());
      try {
        await fs.promises.mkdir(folderPath, { recursive: true });
      } catch (error) {
        // pass
      }
      try {
        await fs.promises.writeFile(filePath, data, {
          encoding: 'base64',
        });
      } catch (error) {
        return res.status(400).json({ error: 'Cannot write to file' });
      }

      const newFile = await files.insertOne({
	      userId: ObjectId(userId),
	      name,
	      type,
	      isPublic,
	      parentId: parentId ? ObjectId(parentId) : 0,
	      localPath: filePath,
      });
      const file = await files.findOne({ _id: newFile.insertedId });
      
        return res.status(201).send({
          id: newFile.insertedId,
          userId: file.userId,
          name: file.name,
          type: file.type,
          isPublic: file.isPublic,
          parentId: file.parentId,
        });
      
    }
  }
}

export default FilesController;
