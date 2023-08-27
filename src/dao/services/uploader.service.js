import multer from 'multer';
import { __dirname } from '../../utils.js';

const uploader = (directory) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `${__dirname}/uploads/${directory}/`);
        },
        filename: (req, file, cb) => {
            // Same as before
            cb(null, file.originalname);
        },
    });

    return multer({ storage });
};

export default uploader;
