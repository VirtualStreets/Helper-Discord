const {get} = require("axios");
module.exports = async (shortUrl) => {
		const response = await get(shortUrl, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 300 && status < 400;
            }
        });
		
		if (response) {
			return response.headers.location;
		}
		
		throw new Error('Invalid Google Maps URL');
	}
