const { v4: uuid } = require("uuid");
const generatePassword = require("omgopass");
const faker = require("faker");

const { sanitiseUsername } = require("../../server/helpers");

const user = () => {
	return {
		userId: uuid(),
		name: faker.name.findName(),
		email: faker.internet.email(),
		password: generatePassword(),
		username: sanitiseUsername(faker.internet.userName()),
		avatar: faker.image.avatar(),
		isVerified: faker.datatype.boolean(),
		isOwner: faker.datatype.boolean(),
		isBlocked: faker.datatype.boolean(),
		createdAt: new Date().toJSON(),
		updatedAt: new Date().toJSON(),
	};
};

module.exports = {
	user,
};
