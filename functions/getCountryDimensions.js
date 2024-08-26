const xml2js = require("xml2js");
const svgPathBoundingBox = require("svg-path-bounding-box");

module.exports = async (countryName, worldMapSvg) => {
    const result = await xml2js.parseStringPromise(worldMapSvg);
    const groups = result.svg.g[0].g;

    let countryPath;
    for (let group of groups) {
        if (group.path) {
            for (let path of group.path) {
                console.log(path["$"].id.toLowerCase().replace(/ /g, ""));
                console.log(countryName);
                if (path["$"].id.toLowerCase() === countryName) {
                    countryPath = path["$"].d;
                    break;
                }
            }
        }
        if (countryPath) break;
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