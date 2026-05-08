import app from './app';

const PORT = process.env.PORT || 2999;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
