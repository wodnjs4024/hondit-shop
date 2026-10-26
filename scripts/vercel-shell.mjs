// On Vercel a static dist/index.html is served for "/" before any rewrite, which would hide the server-rendered home page.
// There the app shell is renamed to app.html (vercel.json rewrites and the server pages read that name). Local builds keep index.html.
import { existsSync, renameSync } from 'node:fs';
if (process.env.VERCEL && existsSync('dist/index.html')) {
  renameSync('dist/index.html', 'dist/app.html');
  console.log('dist/index.html -> dist/app.html');
}
