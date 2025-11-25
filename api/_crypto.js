import { createHash } from 'crypto';

export const hash = (p) => createHash('sha256').update(p + 'XMN_SALT').digest('hex');
export const compare = (p, h) => hash(p) === h;
