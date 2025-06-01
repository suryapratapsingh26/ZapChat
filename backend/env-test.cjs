// env-test.cjs
require('dotenv').config();
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URL exists?:", !!process.env.MONGODB_URL);