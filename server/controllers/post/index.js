const create = require('./create');
const getPostById = require('./getPostById');
const updatePostById = require('./updatePostById');
const deleteById = require('./deleteById');

module.exports = {
	...create,
	...getPostById,
	...updatePostById,
	...deleteById
}
