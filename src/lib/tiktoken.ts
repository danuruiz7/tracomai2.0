
import { encoding_for_model } from 'tiktoken';

export const totalTokens = async (text: string, model: 'gpt-4o') => {
  const encoding =  encoding_for_model(model);
  const tokens = encoding.encode(text);
  return tokens.length;
};