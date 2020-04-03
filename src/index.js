const express = require('express');
require('./db/mongoose'); // to make sure mongoose runs and connection is established
const User = require('./models/user');
const Task = require('./models/task');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT;

// const multer = require('multer');

// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter: (req, file, cb) => {

//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('File must be a wORD DOC'));
//         }
//         cb(undefined, true)
        
//         // cb(undefined, false)
//     }
// })


// const errorMiddleware = (req, res, next) => {
//     throw new Error('From middle');
// }
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send();
// }, (error,req, res, next) => {
//     res.status(400).send(error.message);
// })

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled');
//     }
//     else {
//         next();
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Under maintenance');
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})

// const jwt = require('jsonwebtoken');
// const myFunction = async () => {
//     const token = jwt.sign({ _id: "ghfj" }, "thisismynewcourse", { expiresIn: "5 seconds"} )
//     console.log(token);
//     const data = jwt.verify(token, "thisismynewcourse");
//     console.log(data);
// }
// myFunction();

// const pet = {
//     name: 'Hal'
// }
// pet.toJSON = function () {
//     console.log(this);
//     return {}
// }
// console.log(JSON.stringify(pet));

// const main = async () => {
//     const task = await Task.findById('5e7f8d3e9bfc9a3c0cd4292f');
//     await task.populate("owner").execPopulate();
//     console.log(task.owner);

//     const user = await User.findById('5e7f5541b65e523d386896da');
//     await user.populate('tasks').execPopulate();
//     console.log(user.tasks);
// }
// main();

