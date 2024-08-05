const xml2js = require("xml2js");
const svgPathBoundingBox = require("svg-path-bounding-box");
module.exports = async (countryCode, worldMapSvg) => {
    const result = await xml2js.parseStringPromise(worldMapSvg);
    const paths = result.svg.g[0].path;

    let countryPath;
    for (let path of paths) {
        if (path["$"].id === countryCode) {
            countryPath = path["$"].d;
            break;
        }
    }

    if (countryPath) {
        const bbox = svgPathBoundingBox(countryPath);
        const dimensions = {
            offset: {
                x: bbox.x1,
                y: bbox.y1,
            },
            width: bbox.width,
            height: bbox.height
        };

        console.log(dimensions);
        return dimensions;
    } else {
        console.error('Country path not found!');
        return null;
    }
}
