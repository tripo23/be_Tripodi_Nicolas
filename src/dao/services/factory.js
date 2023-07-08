// import config from '../../config.js'
// import MongoSingleton from '../services/mongo_class.js';
// import { ProductManager as memProduct } from './productManager.memclass.js';
// import { ProductManager as mongoProduct } from './productManager.dbclass.js';
// // import { CartManager as memCart } from './cartManager.memclass.js';
// // import { CartManager as mongoCart } from './cartManager.dbclass.js';

// let factoryProduct;
// let factoryCart;

// switch (config.persistence) {
//     case 'memory':
//         factoryProduct = memProduct;
//         //factoryCart = memCart;
//         break;
    
//     case 'mongo':
//         MongoSingleton.getInstance();
//         factoryProduct = mongoProduct;
//         //factoryCart = mongoCart;
//         break;
    
//     default:
// }
// export { factoryProduct };
// //export { factoryProduct, factoryCart };