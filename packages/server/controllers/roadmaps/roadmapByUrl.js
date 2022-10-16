module.exports = async (req, res) => {
  const roadmap = req.roadmap;

  res.status(200).send({ roadmap });
};
