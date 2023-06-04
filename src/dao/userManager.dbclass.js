import userModel from "./models/users.model.js";
import { createHash, isValidPassword } from "../utils.js";


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


  static #objEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  newUser = async (data) => {
    if (!UserManager.#objEmpty(data)) {
      const newUser = data;
      newUser.password = createHash(newUser.password);
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
      const currentUser = await userModel.findOne({ email: user });
      if (!currentUser) {
        //return res.status(400).send({status: "error", error: "User not found"})
      } else {
        if (!(isValidPassword(currentUser, pass))) {
          return res.status(403).send({status: "error", error: "Bad credentials"})
        } else {
          delete currentUser.password;
          return currentUser;
        }
      }
    } catch (err) {
      this.checkStatus = `validateUser: ${err}`;
    }
  }
}



export default UserManager;