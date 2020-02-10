// modules
const uuid = require("uuid");
const bcrypt = require("bcryptjs");

const memberId = uuid();

const bcryptSalt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync("password", bcryptSalt);

exports.up = database => {
	return database.schema.raw(`
		INSERT INTO
			member(
				member_id,
				first_name,
				email_address,
				password,
				is_verified
			)
		VALUES(
			${memberId},
			"LogChimp"
			"logchimp@codecarrot.net",
			${passwordHash},
			true
		)
  );`);
};

exports.down = database => {
	return database.schema.raw(
		`DELETE FROM member WHERE member_id = '${memberId}';`
	);
};
