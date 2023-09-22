import { Router } from "express";
import { TicketManager } from "../dao/services/ticketManager.dbclass.js";
import { adminOnly, userOnly, auth } from '../utils.js';
const ticket = new TicketManager();
const router = Router();

router.get('/tickets/:tid', adminOnly, async (req, res) => {
    const searched = await ticket.getTicketById(req.params.tid);
    !searched? res.status(404).json({ error: 'No se encontró un ticket con este ID' }) : res.status(200).send(searched);
});

router.get('/tickets', adminOnly, async (req, res) => {
    const tickets = await ticket.getTickets();
    !tickets? res.status(404).json({ error: 'No hay tickets' }) : res.status(200).send(tickets);
})


export default router;