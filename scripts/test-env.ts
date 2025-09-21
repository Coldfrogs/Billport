import dotenv from "dotenv";
dotenv.config();

console.log("Environment variables:");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Found" : "Not found");
console.log("COSTON2_RPC_URL:", process.env.COSTON2_RPC_URL ? "Found" : "Not found");
console.log("COSTON2_RPC_URL value:", process.env.COSTON2_RPC_URL);
