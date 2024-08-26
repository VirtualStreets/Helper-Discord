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
		try {
			const expandedUrl = await expandShortUrl(url);
			return {valid: true, response: expandedUrl};
		} catch (e) {
			return {valid: false, response: "Invalid Url"}
		}
	}
	// https://www.google.com/maps/@40.7128,-74.0060
	if (url.includes("google.com/maps/@")) {
		if (url.startsWith("google.com/maps/@")) {
			url = "https://" + url
		} else if (!url.startsWith("https://www.google.com/maps/@")) {
			return {valid: false, response: "Invalid Url"}
		}
		return {valid: true, response: url};
	}

	return {valid: false, response: "Invalid Url"}
}
