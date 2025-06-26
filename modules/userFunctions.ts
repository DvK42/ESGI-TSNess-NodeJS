import bcrypt from "bcrypt";
export const comparePasswords = async (plainPassword: string, user: { password: string }) => {
  await bcrypt.compare(plainPassword, user.password);
};
