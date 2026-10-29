import mongoose from "mongoose";

// Callback ke andar ke saare DB kaam ek transaction me hote hain.
// Error aaye to sab rollback. Callback retry ho sakta hai, isliye usme data fresh load karo.
export const runInTransaction = (work) => mongoose.connection.transaction(work);