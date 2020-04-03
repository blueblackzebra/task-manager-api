const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');

router.post('/users', async (req,res) => {
    const user = new User(req.body);
    // user.save().then((result) => {
    //     res.status(201).send(user);
    // }).catch((error) => {
    //     res.status(400).send(error); 
    // })
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user: user, token: token});

    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user , token: token});
    } catch(e) {
        res.status(400).send(e.message);
    }
})

router.post('/users/logout', auth, async(req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token

        })
        await req.user.save()

        res.send();
    } catch(e) {
        res.status(500).send(e.message);

    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens =[];
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
})

router.get('/users/me', auth, async (req, res) => {
    // User.find({}).then((users) => {
    //     res.send(users);
    // }).catch((error) => {
    //     res.status(500).send();
    // })


    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch(e) {
    //     res.status(500).send();
    // }

    res.send(req.user);
})

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     // User.findById(_id).then((user) => {
//     //     if (!user){
//     //         return res.status(404).send();
//     //     }

//     //     res.send(user);
//     // }).catch((error) => {
//     //     res.status(500).send(error.message);
//     // })

//     try {
//         const user = await User.findById(_id);

//         if (!user){
//             return res.status(404).send();
//         }
        
//         res.send(user);
        
//     } catch(e) {
//         res.status(500).send();
//     }
// })

router.patch('/users/me', auth, async (req, res) => {

    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates= Object.keys(req.body);

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates'})
    }

    try {
        // const user = await User.findById(req.params.id);

        const user = req.user;
        
        updates.forEach((update) => {
            user[update]=req.body[update];
        })

        await user.save();
        
        // // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        // if (!user){
        //     return res.status(404).send()
        // }

        res.send(user)
    } catch(e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);

        // this one to be used after authentication
        // const user = await User.findByIdAndDelete(req.user._id);  

        // if(!user) {
        //     return res.status(404).send();
        // }

        await req.user.remove();
        res.send(req.user);
    } catch(e) {
        res.status(500).send(e.message);
    }
})

const multer = require('multer');

const avatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    }

})

router.post('/users/me/avatar', auth, avatar.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250}).png().toBuffer()

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send(error.message);
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch(e) {
        res.status(404).send();
    }
})
module.exports = router;