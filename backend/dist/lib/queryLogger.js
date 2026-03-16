"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logQueryPerformance = void 0;
const logQueryPerformance = (queryName, start) => {
    const duration = Date.now() - start;
    console.log(`[DB QUERY] ${queryName} - ${duration}ms`);
};
exports.logQueryPerformance = logQueryPerformance;
