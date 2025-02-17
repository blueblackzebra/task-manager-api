const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate: (value) => {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Do not include password');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate: (value) => {
            if(value < 0) {
                throw new Error('Age must be postive');
            }
        }
    },
    
    tokens : [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token: token})
    await user.save()
    return token;

}

// userSchema.methods.getPublicProfile = function () {
//     const user = this;
//     const userObject = user.toObject()

//     delete userObject.password;
//     delete userObject.tokens;

//     return userObject;
// }

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject()

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email})

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
}


// 'this' gives us access to the document that is about to be saved and 
// we use a normal function because arrow functions don't bind 'this'
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
})

// Cascade delete tasks
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});

    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User;