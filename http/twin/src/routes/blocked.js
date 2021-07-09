"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataService_1 = require("../service/dataService");
const authenticationMiddleware_1 = require("../middlewares/authenticationMiddleware");
const router = express_1.Router();
router.get('/', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    res.json(dataService_1.getBlocklist());
});
router.delete('/:name', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    dataService_1.persistBlocklist(dataService_1.getBlocklist().filter(b => b != req.params.name));
    res.json({ status: 'success' });
});
exports.default = router;
