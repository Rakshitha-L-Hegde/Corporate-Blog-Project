"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishedFilter = void 0;
const client_1 = require("@prisma/client");
exports.publishedFilter = {
    status: client_1.PostStatus.PUBLISHED,
    publishedAt: {
        not: null
    }
};
