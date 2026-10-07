export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(error.statusCode ?? 500).json({ message: error.message ?? "Unexpected server error" });
}
