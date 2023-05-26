import userModel from "./models/users.model.js";
import crypto from 'crypto';

class UserManager {
  static notFound = "err";
  constructor(path) {
    this.path = path;
    this.cart = [];
  }

  checkAvailability = async (email) => {
    let existing = 0;
    const process = await userModel.findOne({ email: email })
    process ? existing = 1 : existing = 0;
    return existing
  }

  checkStatus = () => {
    return this.status;
  }

  static #encryptPass = (pass) => {
    return crypto.createHash('sha256').update(pass).digest('hex');
  }
  static #objEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  newUser = async (data) => {
    if (!UserManager.#objEmpty(data)) {
      const newUser = data;
      newUser.password = UserManager.#encryptPass(newUser.password);
      try {
        const process = await userModel.create(data);
        this.checkStatus = 1;
        return process.email;
      } catch (error) {
        console.log(error);
        this.checkStatus = -1
      }
    } else {
      this.checkStatus = -1
    }
  }

  validateUser = async (user, pass) => {
    try {
      return await userModel.findOne({ email: user, password: crypto.createHash('sha256').update(pass).digest('hex') });
    } catch (err) {
      this.checkStatus = `validateUser: ${err}`;
    }
  }

}

export default UserManager;