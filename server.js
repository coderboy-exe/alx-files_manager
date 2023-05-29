import express from 'express';

import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
})

export default app;
