const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (pid ${process.pid})`);
});

async function shutdown() {
  server.close(async () => {
    await app.locals.closePool();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
module.exports = app;
