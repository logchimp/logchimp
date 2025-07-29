export function getUserPermissions(req, res) {
  const user = req.user;

  res.status(200).send({
    permissions: user.permissions,
  });
}
