module.exports = (url) => {
		const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
		const match = url.match(regex);
		if (match) {
			return {
				lat: parseFloat(match[1]),
				lng: parseFloat(match[2])
			};
		}
		throw new Error('Invalid Google Maps URL');
	}
