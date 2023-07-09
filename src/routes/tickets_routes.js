import { Router } from "express";
import { TicketManager } from "../dao/services/ticketManager.dbclass.js";
const ticket = new TicketManager();
const router = Router();


router.get('/tickets/:tid', async (req, res) => {
    const searched = await ticket.getTicketById(req.params.tid);
    res.status(200).send(searched)
});


export default router;