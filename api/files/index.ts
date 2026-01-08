import { Api } from '../../core/utils/abstract.ts';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { v } from '../../core/utils/validate.ts';
import path from 'node:path';
import { checkEtag, LimitBytes, mimeType } from './utils.ts';
import { rename, rm, stat, writeFile } from 'node:fs/promises';
import { RouteError } from '../../core/utils/route-error.ts';
import { randomUUID } from 'node:crypto';

const MAX_SIZE = 150 * 1024 * 1024; // 150MB
const FILES_DIR = './public/files';

export class FilesApi extends Api {
  handlers = {
    sendFile: async (req, res) => {
      const name = v.file(req.params.filename);
      const filePath = path.join(FILES_DIR, name);
      const ext = path.extname(name);
      let st;
      try {
        st = await stat(filePath);
      } catch {
        throw new RouteError('File not found', 404);
      }
      const etag = `W/${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(
        16
      )}`;

      res.setHeader('ETag', etag);
      res.setHeader('Content-Length', st.size);
      res.setHeader('Last-Modified', st.mtime.toUTCString());
      res.setHeader(
        'Content-Type',
        mimeType[ext] || 'application/octet-stream'
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

      if (checkEtag(req.headers['if-none-match'], etag)) {
        res.status(304);
        res.end();
        return;
      }

      res.status(200);
      const file = createReadStream(filePath);
      await pipeline(file, res);
    },

    uploadFile: async (req, res) => {
      if (req.headers['content-type'] !== 'application/octet-stream') {
        throw new RouteError(
          'Invalid content type, expected application/octet-stream',
          415
        );
      }

      const contentLength = Number(req.headers['content-length']);
      if (!Number.isInteger(contentLength)) {
        throw new RouteError('Invalid content length', 400);
      }

      if (contentLength > MAX_SIZE) {
        throw new RouteError('Payload too large', 413);
      }

      const name = v.file(req.headers['x-filename']);
      const now = Date.now();
      const ext = path.extname(name);
      const filename = `${name.replace(ext, '')}-${now}${randomUUID()}${ext}`;
      const tempPath = path.join(FILES_DIR, `${randomUUID()}.temp`);
      const writePath = path.join(FILES_DIR, filename);
      const writeStream = createWriteStream(tempPath, { flags: 'wx' });
      try {
        await pipeline(req, LimitBytes(MAX_SIZE), writeStream);
        await rename(tempPath, writePath);
        res.status(201).json({ path: `files/${filename}` });
      } catch (error) {
        if (error instanceof RouteError) {
          throw new RouteError(error.message, error.status);
        } else {
          throw new RouteError('Failed to write file', 500);
        }
      } finally {
        await rm(tempPath, { force: true }).catch(() => {});
      }
    },
  } satisfies Api['handlers'];
  routes(): void {
    this.router.get('/files/:filename', this.handlers.sendFile);
    this.router.post('/files', this.handlers.uploadFile);
  }
}
