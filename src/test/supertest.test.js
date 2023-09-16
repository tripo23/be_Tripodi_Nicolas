import chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import config from '../config/config';

const mongoose_url = 'mongodb+srv://practicabe:LT06dW5ewpkPJUOO@cluster0.qn3gvsu.mongodb.net/ecommerce';
const expect = chai.expect;
const requester = supertest(`${config.serverURL}:${config.port}`);
let pid = '';
let cid = '';

describe('Test general del servidor de ecommerce', async function () {

    before(async function () {
        try {
            pid = '';
            await mongoose.connect(mongoose_url, { useNewUrlParser: true, useUnifiedTopology: true });

            console.log('Connected to MongoDB');

            // const collections = await mongoose.connection.db.listCollections().toArray();
            // const collectionNames = collections.map(collection => collection.name);
            // console.log('Existing Collections:', collectionNames);

            try {
                await mongoose.connection.db.dropCollection('products_test');
                console.log('drop de products_test');
            } catch (error) {
                console.log('falló el drop de products_test');
            }

            try {
                await mongoose.connection.db.dropCollection('carts_test');
                console.log('drop de carts_test');
            } catch (error) {
                console.log('falló el drop de carts_test');
            }
            
            try {
                await mongoose.connection.db.dropCollection('users_tests');
                console.log('drop de users_tests');
            } catch (error) {
                console.log('falló el drop de users_tests');
            }

        } catch (err) {
            console.error(err.message);
        }
    });

    describe('Test de productos', async function () {

        it('POST /api/products añade un producto', async function () {
            const newProduct = {
                title: 'producto 11',
                description: 'producto once!',
                code: 'ac345',
                price: 100,
                stock: 10,
                status: true,
                thumbnails: ['thumbnail'],
                category: 'electronics'
            }

            const { statusCode, ok } = await requester.post('/api/products').send(newProduct)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);

        })

        it('GET /api/products devuelve todos los productos', async function () {
            const { statusCode, ok, body } = await requester.get('/api/products')
            pid = body.docs[0]._id

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.be.an('object')
        })

        it('PUT /api/products/{pid} actualiza un producto', async function () {
            const response = await requester.get('/api/products')
            const currentProd = response.body.docs[0]
            const updatedProd = { price: 55, title: 'producto actualizado' }
            const { statusCode, ok } = await requester.put(`/api/products/${pid}`).send(updatedProd)
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);

            const responseNew = await requester.get('/api/products')
            const modifiedProd = responseNew.body.docs[0]
            expect(modifiedProd).not.to.be.eql(currentProd)

        })

    })

    describe('Test de carrito', async function () {
        it('POST /api/carts crea un carrito', async function () {
            const { statusCode, ok, body } = await requester.post('/api/carts')
            cid = body.cartID;
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body.cartID).to.be.an('string')
        })

        it('GET /api/carts/{cid} devuelve un carrito', async function () {
            const { statusCode, ok, body } = await requester.get(`/api/carts/${cid}`)
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.be.an('object')
        })

        it('POST /api/carts/{cid} añade un producto al carrito', async function () {
            const { statusCode, ok } = await requester.post(`/api/carts/${cid}/product/${pid}`)
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
        })
    })

    describe ('Test de users', async function () {
        it ('POST /signup crea un usuario', async function () {
            const newUser = {
                firstName: "Usuario",
                lastName: "De Prueba",
                email: 'usrtest@test.com',
                age: 30,
                password: 'abc123',
                role: 'user',
                cart: cid
            }
            const {statusCode, ok, body } = await requester.post('/signup').send(newUser)
            expect(statusCode).to.equal(200);
        })

        it ('POST /login loguea un usuario', async function () {
            const {statusCode, ok} = await requester.post('/login').send({
                email: 'usrtest@test.com',
                password: 'abc123'
            })
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
        })

        it ('POST /login rechaza a un usuario con credenciales incorrectas', async function () {
            const {statusCode, ok, body } = await requester.post('/login').send({
                email: 'usrtest@test.com',
                password: 'abc1234'
            })
            expect(statusCode).not.to.equal(200);
            expect(ok).to.equal(false);
        })
    })

});
