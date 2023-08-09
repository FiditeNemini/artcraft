import { useState } from 'react';
import { v4 as uuidv4 } from "uuid";

export default function useConvertIdempotencyToken() {
  return useState(uuidv4());
};