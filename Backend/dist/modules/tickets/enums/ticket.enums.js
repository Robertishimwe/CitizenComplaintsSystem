"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPriority = exports.TicketStatus = void 0;
// src/modules/tickets/enums/ticket.enums.ts
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["NEW"] = "NEW";
    TicketStatus["ASSIGNED"] = "ASSIGNED";
    TicketStatus["IN_PROGRESS_PENDING_AGENT"] = "IN_PROGRESS_PENDING_AGENT";
    TicketStatus["IN_PROGRESS_PENDING_CITIZEN"] = "IN_PROGRESS_PENDING_CITIZEN";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "LOW";
    TicketPriority["MEDIUM"] = "MEDIUM";
    TicketPriority["HIGH"] = "HIGH";
    TicketPriority["URGENT"] = "URGENT";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
