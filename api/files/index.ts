import { Api } from '../../core/utils/abstract.ts';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { v } from '../../core/utils/validate.ts';
import path from 'node:path';
import { checkEtag, mimeType } from './utils.ts';
import { stat, writeFile } from 'node:fs/promises';
import { RouteError } from '../../core/utils/route-error.ts';

export class FilesApi extends Api {
  handlers = {
    sendFile: async (req, res) => {
      const name = v.file(req.params.filename);
      const filePath = `./public/files/${name}`;
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
      const name = req.headers['x-filename'];
      const writeStream = createWriteStream(`./public/files/${name}`);
      await pipeline(req, writeStream);
      res.end('Ok');
    },
  } satisfies Api['handlers'];
  routes(): void {
    this.router.get('/files/:filename', this.handlers.sendFile);
    this.router.post('/files', this.handlers.uploadFile);
  }
}
