import * as url from 'url';
import bcrypt from 'bcrypt';
import { Faker, en } from '@faker-js/faker';
import { transport } from './config/nodemailer.config.js'
import fs from 'fs';


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const faker = new Faker({ locale: [en] })

const createHash = (pass) => {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
}

const isValidPassword = (userInDb, pass) => {
    return bcrypt.compareSync(pass, userInDb.password);
}

function auth(req, res, next) {
    if (req.session?.user) {
        return next();
    }
    res.render('login', {
        sessionInfo: req.sessionStore
    });
}

function adminOnly(req, res, next) {
    if (req.session?.role == 'admin') {
        console.log(req.session.role);
        return next();
    } else {
        console.log(req.session.role);
        res.render('forbidden');
    }
}
function adminOrPremiumOnly(req, res, next) {
    if (req.session?.role == 'admin' || req.session?.role == 'premium') {
        console.log(req.session.role);
        return next();
    } else {
        console.log(req.session.role);
        res.render('forbidden');
    }
}

function userOnly(req, res, next) {
    if (req.session?.role == 'user' || req.session?.role == 'premium') {
        console.log(req.session.role);
        return next();
    } else {
        console.log(req.session.role);
        res.render('forbidden');
    }
}

function generateTicketCode() {
    const characters = '0123456789ABCDEF';
    let hexCode = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        hexCode += characters[randomIndex];
    }
    return hexCode;
}

const newFakeUser = () => {
    let products = [];
    const productsQty = parseInt(faker.number.int(20));
    for (let i = 0; i < productsQty; i++) { products.push(generateProduct()); }

    const role = parseInt(faker.number.int(1)) === 1 ? 'client' : 'seller';

    return {
        id: faker.database.mongodbObjectId(),
        code: faker.string.alphanumeric(8),
        name: faker.person.firstName(),
        last_name: faker.person.lastName,
        sex: faker.person.sex(),
        birthDate: faker.date.birthdate(),
        phone: faker.phone.number(),
        image: faker.image.avatar(),
        email: faker.internet.email(),
        role: role,
        premium: faker.datatype.boolean(),
        current_job: faker.person.jobType(),
        products: products
    }
}

const newFakeProduct = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({ dec: 0 }),
        status: true,
        image: faker.image.urlLoremFlickr(),
        code: faker.number.hex({ min: 0, max: 65535 }),
        stock: faker.number.int(50),
        category: faker.commerce.department()
    }
}

const errorsDict = {
    ROUTING_ERROR: { code: 404, msg: 'No se encuentra la ruta solicitada' },
    INVALID_TYPE_ERROR: { code: 400, msg: 'No corresponde el tipo de dato' },
    DATABASE_ERROR: { code: 500, msg: 'No se puede conectar a la base de datos' },
    INTERNAL_ERROR: { code: 500, msg: 'Error interno de ejecución del servidor' }
}

const generateToken = (length) => {
    const token = [...Array(length)]
        .map(() => (Math.random() * 36 | 0).toString(36))
        .join('');
    return token;
}

const generateHashedToken = async (length) => {
    try {
        const token = generateToken(length);
        const saltRounds = 10; // You can adjust the number of salt rounds as per your needs
        const hashedToken = await bcrypt.hash(token, saltRounds);
        return hashedToken;
    } catch (error) {
        console.error('Error generating hashed token:', error);
        throw error; // Rethrow the error to the caller  
    }
}

// Function to calculate the expiration time (e.g., 30 minutes from now)
const calculateExpiryTime = (minutes) => {
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + minutes * 60 * 1000); // 30 minutes in milliseconds
    return expiryTime;
}


// Function to send the reset password email
const sendResetPasswordEmail = async (userEmail, resetLink) => {
    const result = await transport.sendMail({
        from: 'tripodi.nicolas@gmail.com',
        to: userEmail,
        subject: 'Restablecer contraseña',
        html: `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center;">Restablecer contraseña</h2>
                <p>Hola ${userEmail},</p>
                <p>Recibimos una solicitud para cambiar tu contraseña. Si vos no generaste el pedido, por favor ignorá este correo.</p>
                <p>Si querés cambiar tu contraseña, hacé click en el siguiente link:</p>
                <p style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Cambiar contraseña</a>
                </p>
                <p>Si tenés dudas o requerís asistencia, por favor ponete en contacto con nuestro equipo de soporte.</p>
                <p>¡Gracias!</p>
            </div>
        
        </body>
        </html>`

    })
}

const sendDeletionAlertEmail = async (userEmail) => {
    const result = await transport.sendMail({
        from: 'tripodi.nicolas@gmail.com',
        to: userEmail,
        subject: 'Eliminación de cuenta',
        html: `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu cuenta ha sido eliminada por falta de uso</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center;">Eliminación de cuenta</h2>
                <p>Hola ${userEmail},</p>
                <p>Debido a un período de actividad mayor a 48hs, procedimos a eliminar tu cuenta. Para continuar usando la plataforma deberás registrarte nuevamente.</p>
                <p>Si tenés dudas o requerís asistencia, por favor ponete en contacto con nuestro equipo de soporte.</p>
                <p>¡Gracias!</p>
            </div>
            </body>
            </html>`
    })
}

const sendProductDeletionAlertEmail = async (userEmail, product) => {
    const result = await transport.sendMail({
        from: 'tripodi.nicolas@gmail.com',
        to: userEmail,
        subject: 'Eliminación de producto',
        html: `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu producto ha sido eliminado</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="text-align: center;">Eliminación de producto</h2>
                <p>Hola ${userEmail},</p>
                <p>Tu producto ${product.title} (código: ${product.code}) ha sido eliminado de la plataforma.</p>
                <p>Si tenés dudas o requerís asistencia, por favor ponete en contacto con nuestro equipo de soporte.</p>
                <p>¡Gracias!</p>
                </div>
                </body>
                </html>`
        })
}


export { __filename, __dirname, createHash, isValidPassword, auth, adminOnly, userOnly, adminOrPremiumOnly, generateTicketCode, newFakeUser, newFakeProduct, errorsDict, generateHashedToken, calculateExpiryTime, sendResetPasswordEmail, sendDeletionAlertEmail, sendProductDeletionAlertEmail };