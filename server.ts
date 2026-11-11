import { createServer as createViteServer } from 'vite';
import { app } from './src/serverApp.js';

const PORT = process.env.PORT || 3000;

// Mount Vite Dev Middleware when running standalone
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🌸 Casa & Beleza Express server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
