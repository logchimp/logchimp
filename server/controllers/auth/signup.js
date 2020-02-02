// modules
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');

const database = require("../../database");

const signupSchema = Joi.object({
	email: Joi.string()
		.email()
    .min(4)
    .max(50)
    .required(),
	password: Joi.string()
		.min(6)
    .max(72)
    .required(),
});

exports.signup = (req, res, next) => {

	const valid = signupSchema.validate(req.body);

	if (valid.error) {
		res.status(422);
		next(valid.error);
		return false;
	}

	const { email, password } = valid.value;

  // validate member existance in database
  database.query(`
    SELECT
      email_address
    FROM
      member
    WHERE
      email_address = '${email}';
  `).then(result => {
    /**
     * res.rows
     * returns array of object
     */
    if (result.rows[0]) {
      res.status(409).send({
        "status": {
          "code": 409,
          "type": "error"
        },
        "error": {
          "code": "invalid_email",
          "message": "E-Mail already taken"
        }
      })
    } else {
      // password hashing
      const bcryptSaltRounds = 10;
      const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);
      const passwordHash = bcrypt.hashSync(password, bcryptSalt);

      // generate unique indentification
      const memberId = uuid(email)

      // save member to database
      database
        .query(`
          INSERT INTO
            member(member_id, email_address, password)
          VALUES
            ('${memberId}', '${email}', '${passwordHash}')
          RETURNING
            member_id, email_address, created_at;
        `)
        .then(result => {
          const newMember = result.rows[0];

          /**
           * authToken sent via email will expire after 1 hr
           */
          const authToken = jwt.sign(newMember, 'scretKey', { expiresIn: '1h' });

          res.status(200).send({
            status: {
              code: 200,
              type: "success"
            },
            member: newMember
          })

          // todo: send email for account verification

          next();
        })
        .catch(error => {
          console.error(error)
        })
    }
  }).catch(error => {
    console.error(error);
  })

}
