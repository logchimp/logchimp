const { v4: uuid } = require("uuid");
const generatePassword = require("omgopass");
const faker = require("faker");
const { nanoid } = require("nanoid");

const {
	generateHexColor,
	sanitiseUsername,
	sanitiseURL,
} = require("../../server/helpers");

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

const roadmap = () => {
	const name = faker.commerce.productName();

	return {
		id: uuid(),
		name,
		url: `${sanitiseURL(name)}-${nanoid(10)}`,
		index: faker.datatype.number(),
		color: generateHexColor(),
		display: faker.datatype.boolean(),
		created_at: new Date().toJSON(),
		updated_at: new Date().toJSON(),
	};
};

const board = () => {
	const name = faker.name.title();

	return {
		boardId: uuid(),
		name,
		url: `${sanitiseURL(name)}-${nanoid(10)}`,
		color: generateHexColor(),
		display: faker.datatype.boolean(),
		view_voters: faker.datatype.boolean(),
		createdAt: new Date().toJSON(),
		updatedAt: new Date().toJSON(),
	};
};

module.exports = {
	user,
	roadmap,
	board,
};
