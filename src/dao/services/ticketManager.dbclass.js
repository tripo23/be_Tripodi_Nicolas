import mongoose from "mongoose";
import { generateTicketCode } from '../../utils.js';
import ticketModel from "../models/tickets.model.js";
import productModel from "../models/products.model.js";

class TicketManager {
    static notFound = "err";
    constructor(path) {
        this.path = path;
        this.ticket = [];
    }

    newTicket = async (data) => {

        const newTicket = {
            code: generateTicketCode(),
            purchase_datetime: new Date().toLocaleString(),
            amount: data.amount,
            purchaser: 'test',
            products:[]
        };
        const process = await ticketModel.create(newTicket);
        return process._id;
    }

    getTicketById = async (id) => {
        let found;
        try {
            found = await ticketModel.findById(id).populate({
                path: 'products.product',
                model: productModel,
                lean: true
            });
        } catch (err) {
            found = TicketManager.notFound;
        }
        return found
    }

    addProducts = async (tid, product ) => {
        try {
            const ticketToUpdate = await this.getTicketById(tid);
            if (ticketToUpdate == TicketManager.notFound) {
                return "err";
            } else {
                ticketToUpdate.products.push({ product: new mongoose.Types.ObjectId(product.pid), quantity: parseInt(product.quantity) });
            }
            const process = await ticketToUpdate.save();
        }
        catch (error) {
            console.log(error);
        }
    }
}


export { TicketManager };