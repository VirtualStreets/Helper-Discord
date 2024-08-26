const Eris = require("eris");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fetchstreetviewImage = require("../functions/fetchstreetviewImage");
const validateGoogleMapsUrl = require("../functions/validateGoogleMapsUrl");
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl");
const getCountryBoundingBox = require("../functions/getCountryBoundingBox");
const getCountryDimensions = require("../functions/getCountryDimensions");
const getGeocodingData = require("../functions/getGeocodingData");
const createCanvasImage = require("../functions/createCanvasImage");
const fs = require('fs');
const svgPathBoundingBox = require('svg-path-bounding-box');
const {parseStringPromise} = require("xml2js");

module.exports.run = async (client, interaction) => {

    let url = interaction.data.options[0].value
    console.log(url)
    url = await validateGoogleMapsUrl(url)

    if (!url.valid) return interaction.createMessage({
        content: url.response
    })

    const coordinates = extractCoordinatesFromUrl(url.response)

    const {lat, lng, fov, heading, pitch} = coordinates

    const geocodingData = await getGeocodingData(lat, lng)

    const countryCode = geocodingData.address.country_code;
    const countryName = geocodingData.address.country;
    const countryBoundingBox = await getCountryBoundingBox(countryName)
    console.log(countryBoundingBox)

    const difLat = countryBoundingBox.maxLat - countryBoundingBox.minLat;
    const difLng = countryBoundingBox.maxLon - countryBoundingBox.minLon;

    const latRatio = (lat - countryBoundingBox.minLat) / difLat;
    const lngRatio = (lng - countryBoundingBox.minLon) / difLng;

    const worldMapSvg = fs.readFileSync('assets/img/World.svg', 'utf8');

    const result = await parseStringPromise(worldMapSvg);

    const svgElement = result.svg
    console.log("svg element")
    console.log(svgElement)

    const worldMapDimensions = {
        width: svgElement["$"].width,
        height: svgElement["$"].height
    }
    const countryDimensions = await getCountryDimensions(countryName.toLowerCase().replace(/ /g, "_"), worldMapSvg);
    console.log("country dimensions")
    console.log(countryDimensions)

    const width = 1600;
    const height = 900;
    const canvas = await createCanvas(width, height);

    const ctx = await canvas.getContext("2d");

    ctx.fillStyle = "white";
    await ctx.fillRect(0, 0, width, height);
    const svg = await loadImage(`assets/img/countrySvg/${countryName.replace(/ /g, "")}.svg`);

    const streetviewImageProps = {
        width: 780,
        height: 530,
        offset: {
            x: 800,
            y: 26
        }
    }
    const imageBuffer = await fetchstreetviewImage(lat, lng, heading, pitch, fov);
    const canvasBuffer = await createCanvasImage(imageBuffer, streetviewImageProps.width, streetviewImageProps.height);
    const streetviewImage = await loadImage(canvasBuffer);


    ctx.save();

    ctx.beginPath();
    ctx.moveTo(streetviewImageProps.offset.x + 50, streetviewImageProps.offset.y);
    ctx.lineTo(streetviewImageProps.offset.x + streetviewImageProps.width - 50, streetviewImageProps.offset.y);
    ctx.quadraticCurveTo(streetviewImageProps.offset.x + streetviewImageProps.width, streetviewImageProps.offset.y, streetviewImageProps.offset.x + streetviewImageProps.width, streetviewImageProps.offset.y + 50);
    ctx.lineTo(streetviewImageProps.offset.x + streetviewImageProps.width, streetviewImageProps.offset.y + streetviewImageProps.height - 50);
    ctx.quadraticCurveTo(streetviewImageProps.offset.x + streetviewImageProps.width, streetviewImageProps.offset.y + streetviewImageProps.height, streetviewImageProps.offset.x + streetviewImageProps.width - 50, streetviewImageProps.offset.y + streetviewImageProps.height);
    ctx.lineTo(streetviewImageProps.offset.x + 50, streetviewImageProps.offset.y + streetviewImageProps.height);
    ctx.quadraticCurveTo(streetviewImageProps.offset.x, streetviewImageProps.offset.y + streetviewImageProps.height, streetviewImageProps.offset.x, streetviewImageProps.offset.y + streetviewImageProps.height - 50);
    ctx.lineTo(streetviewImageProps.offset.x, streetviewImageProps.offset.y + 50);
    ctx.quadraticCurveTo(streetviewImageProps.offset.x, streetviewImageProps.offset.y, streetviewImageProps.offset.x + 50, streetviewImageProps.offset.y);
    ctx.closePath();

    ctx.clip();
    await ctx.drawImage(streetviewImage, streetviewImageProps.offset.x, streetviewImageProps.offset.y, streetviewImageProps.width, streetviewImageProps.height);
    ctx.restore();

    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 250;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 40;

    // experimental
    const x = 974;
    const y = 464;
    let actualWidth = 400;
    let actualHeight = actualWidth * svg.height / svg.width;

    ctx.drawImage(svg, x, y, actualWidth, actualHeight);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "black";

    console.log(worldMapDimensions.width)
    console.log(worldMapDimensions.height)
    console.log("country dimensions")
    console.log(countryDimensions)
    console.log(countryBoundingBox)
    const maxLeftSvg =  countryDimensions.offset.x / worldMapDimensions.width
    const maxTopSvg =  countryDimensions.offset.y / worldMapDimensions.height;
    const maxRightSvg = (countryDimensions.offset.x + countryDimensions.width) / worldMapDimensions.width;
    const maxBottomSvg = (countryDimensions.offset.y + countryDimensions.height) / worldMapDimensions.height;
    const maxLeftActualMap = (parseFloat(countryBoundingBox.minLon) + 180) / 360;
    const maxTopActualMap = (parseFloat(countryBoundingBox.maxLat)) / 180;
    const maxRightActualMap = (parseFloat(countryBoundingBox.maxLon) + 180) / 360;
    const maxBottomActualMap = (parseFloat(countryBoundingBox.minLat)) / 180;

    const horizontalDifference = - (maxRightSvg - maxLeftSvg) + (maxRightActualMap - maxLeftActualMap);
    const verticalDifference = (maxBottomSvg - maxTopSvg) - (maxBottomActualMap - maxTopActualMap);

    console.log("ratio")
    console.log(lngRatio)
    console.log(latRatio)
    console.log(horizontalDifference* actualWidth)
    console.log(verticalDifference* actualHeight)

    const finalPointXOffset = x + (lngRatio) * actualWidth
    const finalPointYOffset = y + (1-latRatio) * actualHeight
    // const finalPointXOffset = x+(actualWidth+horizontalDifference * actualWidth) * (lngRatio)
    // const finalPointYOffset = y+(actualHeight+verticalDifference * actualHeight) * (1-latRatio)

    const circleRadius={
        background: 4,
        foreground: 4
    }

    ctx.fillStyle = '#DEA1B7';

    ctx.beginPath();
    // ctx.arc(x+svg.width* (lngRatio)+(1+1.3/difLng) , y+svg.height* (1-latRatio)/(1+2.2/difLat), circleRadius.background, 0, Math.PI * 2, true);
    ctx.arc(x+svg.width* (lngRatio) , y+svg.height* (1-latRatio), circleRadius.background*2, 0, Math.PI * 2, true);
    // ctx.arc(finalPointXOffset, finalPointYOffset, circleRadius.background, 0, Math.PI * 2, true);

    ctx.fill();
    ctx.fillStyle = '#DC0150';

    ctx.beginPath();
    ctx.arc(finalPointXOffset, finalPointYOffset, circleRadius.foreground, 0, Math.PI * 2, true);

    ctx.fill();

    const virtualstreetsIcon = {
        data: await loadImage('assets/img/virtualstreetsIcon.png'),
        width: 48,
        height: 48,
        offset: {
            x: 637,
            y: 836
        }
    };

    ctx.drawImage(virtualstreetsIcon.data, virtualstreetsIcon.offset.x, virtualstreetsIcon.offset.y, virtualstreetsIcon.width, virtualstreetsIcon.height);

    const virtualstreetsName = {
        data: "VirtualStreets.org",
        fontSize: 16,
        fontWeight: 600,
        textColor: "black",
        offset: {
            x: 694,
            y: 836+48/2+16/2
        }
    };

    ctx.fillStyle = virtualstreetsName.textColor;
    ctx.font = `${virtualstreetsName.fontWeight} ${virtualstreetsName.fontSize}px Arial`;
    ctx.fillText(virtualstreetsName.data, virtualstreetsName.offset.x, virtualstreetsName.offset.y);




    ctx.font = '600 64px Arial'
    ctx.fillText(countryName, 44, 51+82);

    ctx.fillStyle = "black";
    ctx.font = '500 36px Arial'
    ctx.fillText("got a new coverage", 44, 104+82);

    ctx.fillStyle = "black";
    ctx.font = '500 36px Arial'
    ctx.fillText("On road", 44, 252+82);

    ctx.fillStyle = "black";
    ctx.font = '500 54px Arial'
    ctx.fillText("R318", 192, 256+82);

    ctx.fillStyle = "black";
    ctx.font = '500 36px Arial'
    ctx.fillText("in", 329, 252+82);

    ctx.fillStyle = "black";
    ctx.font = '500 54px Arial'
    ctx.fillText("Western Cape", 367, 256+82);


    const buffer = await canvas.toBuffer("image/png");


    await interaction.channel.createMessage(
        {
            content: "Here is your graphic",
        },
        [{
            file: buffer,
            name: "image.png"
        }]
    )

}

module.exports.help = {
    name: "graphic",
    description: "Generate very cool graphic",
    options: [
        {
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            name: "url",
            description: "Url of a location on Google Maps",
            required: true
        },
    ]
}