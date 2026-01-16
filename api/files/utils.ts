import { once, Transform } from 'node:stream';
import { RouteError } from '../../core/utils/route-error.ts';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { rename } from 'node:fs/promises';

let size = 0; // System Zeros

export const mimeType: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

export function checkEtag(match: string | undefined, etag: string) {
  if (!match) return false;
  const tags = match.split(',').map((x) => x.trim());
  return tags.includes(etag);
}

export function LimitBytes(bytes: number) {
  return new Transform({
    transform(chunk, _, next) {
      size += chunk.length;
      if (size > bytes) {
        throw new RouteError('File too large', 413);
      }
      next(null, chunk);
    },
  });
}

export async function cropImage(input: string, width: number, height: number) {
  try {
    const ext = path.extname(input);
    const output = input.replace(ext, `.temp${ext}`);
    const command = 'vipsthumbnail';
    const args = [input, '-s', `${width}x${height}`, '--crop', '-o', output];
    const child = spawn(command, args);
    await once(child, 'close');
    await rename(output, input);
  } catch (error) {
    throw new RouteError('Failed to crop image', 400);
  }
}
