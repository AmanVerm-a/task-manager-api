const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

app.listen(port, () => console.log(`Server is up on http://localhost:${port}`));

const Task = require('./models/task');
const User = require('./models/user');

const main = async () => {
  // const task = await Task.findById('64509c442e30a13d2bc564c5');
  // await task.populate('owner')
  // console.log(task.owner);

  const user = await User.findById('644f6dfd48e7fb1a44b2cf48');
  await user.populate('tasks')
  console.log(user.tasks)
}
// main();