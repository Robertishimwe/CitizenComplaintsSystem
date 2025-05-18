"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto")); // For generating random passwords
const SALT_ROUNDS = 10; // Or from env
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateRandomPassword = (length = 12) => {
    // Generate a cryptographically secure random string
    // This example is basic; consider more robust generation for production
    return crypto_1.default.randomBytes(Math.ceil(length / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, length); // return required number of characters
};
exports.generateRandomPassword = generateRandomPassword;
