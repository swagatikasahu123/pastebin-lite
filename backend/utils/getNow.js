function getNow(req) {
  // Deterministic time for automated testing
  if (
    process.env.TEST_MODE === "1" &&
    req.headers["x-test-now-ms"]
  ) {
    const ms = Number(req.headers["x-test-now-ms"]);
    if (!Number.isNaN(ms)) {
      return new Date(ms);
    }
  }

  // Default: real system time
  return new Date();
}

module.exports = getNow;
