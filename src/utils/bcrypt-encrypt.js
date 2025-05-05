import { hash, compare } from 'bcrypt';

export const decode = async (data, salt) => {
  const decoded = await hash(data, salt);
  return decoded;
};

export const encode = async (data, decodedData) => {
  const encoded = await compare(data, decodedData);
  return encoded;
};
