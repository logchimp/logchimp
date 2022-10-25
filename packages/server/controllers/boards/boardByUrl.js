module.exports = async (req, res) => {
  const board = req.board;

  res.status(200).send({ board });
};
