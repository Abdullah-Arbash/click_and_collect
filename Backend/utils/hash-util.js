import bcrypt from "bcrypt";

export async function hashPassword(password) {
    // const salt
    const salt = "$2b$10$4935SryWCifn9DnjX.lNPO";
    // Use the salt to hash the password
    const hash = await bcrypt.hash(password, "$2b$10$4935SryWCifn9DnjX.lNPO");
    return hash;
}
