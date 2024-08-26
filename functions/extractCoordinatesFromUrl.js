module.exports = (url) => {
	console.log(url)
	const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),3a,(\d+(\.\d+)?)y,(-?\d+(\.\d+)?)h,(-?\d+(\.\d+)?)t/;	const match = url.match(regex);
	console.log(match)
	if (match) {
		return {
			lat: parseFloat(match[1]),
			lng: parseFloat(match[2]),
			fov: parseFloat(match[3]),
			heading: parseFloat(match[5]),
			pitch: parseFloat(match[7])
		};
	} else {
		throw new Error('Invalid Google Maps URL');

	}
}