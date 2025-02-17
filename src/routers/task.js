const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth,  async (req, res) => {
    // const task = new Task(req.body);
    
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send(e);
    }
})


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req,res) => {

    const match = {};
    const sort = {};

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }




    try {
        // alternate method
        // const tasks = await Task.find({ owner: req.user._id, ...match});
        
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate();
        res.send(req.user.tasks); // use res.send(tasks) here
    } catch(error) {
        res.status(500).send(error.message);
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks);
    // }).catch((error) => {
    //     res.status(500).send(error.message);
    // })
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        // const task = await Task.findById(_id);

        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch(error) {
        res.status(500).send(error.message);
    }

    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send();
    //     }
    //     res.send(task);
    // }).catch((error) => {
    //     res.status(500).send(error.message);
    // })
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const allowedUpdates = ['completed', 'description'];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates'})
    }

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});

       
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            task[update]=req.body[update];
        })

        await task.save();

        res.send(task);

    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

        if (!task) {
            return res.status(404).send()
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e.message);
    }
})

module.exports = router;