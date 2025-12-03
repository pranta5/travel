import bcrypt from "bcryptjs";
export const hashPwd = (pwd: string) => bcrypt.hash(pwd, 12);
export const comparePwd = (pwd: string, hash: string) =>
  bcrypt.compare(pwd, hash);
