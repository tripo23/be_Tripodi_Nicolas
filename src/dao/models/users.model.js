import mongoose from 'mongoose';

const collection = 'users';
//const collection = 'users_test';

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
    documents: {
        name: {type: String},
        reference: {type: String},
    },
    last_connection: {type: Date},
    resetToken: {type: String},
    resetTokenExpiration: {type: Date},
    doc_id: {type: String},
    doc_address: {type: String},
    doc_account: {type: String},
});

const userModel = mongoose.model(collection, schema);

export default userModel;