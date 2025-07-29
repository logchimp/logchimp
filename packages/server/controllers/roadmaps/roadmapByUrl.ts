export async function roadmapByUrl(req, res) {
  const roadmap = req.roadmap;

  res.status(200).send({ roadmap });
}
