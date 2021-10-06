const _ = require("lodash");
const fs = require("fs-extra");

const logchimpConfig = require("../../server/utils/logchimpConfig");

process.env['LOGCHIMP__SERVER__SECRET_KEY'] = 'my-env-key';

fs.writeFileSync("logchimp.config.json", JSON.stringify({
	"server": {
		"port": 9999,
		"secretKey": "Diq1-Xir9"
	}
}));

const config = logchimpConfig();

describe("validate logchimpConfig", () => {
	
	it('should read configs', () => {
		const { secretKey, port } = config.server;
		expect(secretKey).toEqual('my-env-key');
		expect(port).toEqual(9999);
	});

});
