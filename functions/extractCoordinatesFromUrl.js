module.exports = (url) => {
	const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),3a,(\d+\.\d+)y,(\d+\.\d+)h,(\d+\.\d+)t/;
	const match = url.match(regex);
	if (match) {
		return {
			lat: parseFloat(match[1]),
			lng: parseFloat(match[2]),
			fov: parseFloat(match[3]),
			heading: parseFloat(match[4]),
			pitch: parseFloat(match[5])
		};
	}
	throw new Error('Invalid Google Maps URL');
}