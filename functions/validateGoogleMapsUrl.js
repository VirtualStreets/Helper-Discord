const expandShortUrl = require("./expandShortUrl");
module.exports = async (url) => {
	if (!url.includes("maps.app.goo.gl/") && !url.includes("google.com/maps/@")) return {valid: false, response: "Invalid Url"}
	// https://maps.app.goo.gl/ft8s2XcvLWpiU1bG7
	if (url.includes("maps.app.goo.gl/")) {
		if (url.startsWith("maps.app.goo.gl/")) {
			url = "https://" + url
		} else if (!url.startsWith("https://maps.app.goo.gl/")) {
			return {valid: false, response: "Invalid Url"}
		}
		
		return await {valid: true, response: await expandShortUrl(url)}
	}
}
