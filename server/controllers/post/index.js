const create = require('./create');
const filterPost = require('./filterPost');
const getPostById = require('./getPostById');
const updatePostById = require('./updatePostById');
const deleteById = require('./deleteById');

module.exports = {
	...create,
	...filterPost,
	...getPostById,
	...updatePostById,
	...deleteById
}
