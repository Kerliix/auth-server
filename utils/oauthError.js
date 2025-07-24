export function createOAuthError(error, description, status = 400) {
  const err = new Error(description);
  err.name = error;
  err.status = status;
  return err;
}
