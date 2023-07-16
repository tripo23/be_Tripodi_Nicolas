import * as url from 'url';
import bcrypt from 'bcrypt';
import { Faker, en } from '@faker-js/faker';

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

function userOnly(req, res, next) {
    if (req.session?.role == 'user') {
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

    const role = parseInt(faker.number.int(1)) === 1 ? 'client': 'seller';

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
        price: faker.commerce.price({dec:0}),
        status: true,
        image: faker.image.urlLoremFlickr(),
        code: faker.number.hex({ min: 0, max: 65535 }),
        stock: faker.number.int(50),
        category: faker.commerce.department()
    }
}


export { __filename, __dirname, createHash, isValidPassword, auth, adminOnly, userOnly, generateTicketCode, newFakeUser, newFakeProduct };