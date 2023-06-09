import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    age: { type: Number, required: true},
    role: {type: String, default: 'user'},
    avatar: {type: String},
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
    },
});

const userModel = mongoose.model(collection, schema);

export default userModel;