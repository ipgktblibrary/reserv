export type UpdateBookerInput = {
  id: string;
  is_blocked: boolean;
  block_reason: string | null;
};
