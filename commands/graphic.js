const Eris = require("eris");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fetchStreetViewImage = require("../functions/fetchStreetViewImage");
const validateGoogleMapsUrl = require("../functions/validateGoogleMapsUrl");
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl");
const getCountryBoundingBox = require("../functions/getCountryBoundingBox");

async function createCanvasImage(imageBuffer) {
    const targetWidth = 780;
    const targetHeight = 530;
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');

    // Load the Street View image
    const image = await loadImage(imageBuffer);

    // Calculate the scale to cover the 780x530 area without deforming
    const scale = Math.max(targetWidth / image.width, targetHeight / image.height);

    // Calculate the position to center the image
    const x = (targetWidth / 2) - (image.width * scale / 2);
    const y = (targetHeight / 2) - (image.height * scale / 2);

    // Draw the image scaled and centered on the canvas
    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

    return canvas.toBuffer();
}

module.exports.run = async (client, interaction) => {

    let url = "https://maps.app.goo.gl/CGWzA7kPsgEd23yn6"
    url = await validateGoogleMapsUrl(url)

    if (!url.valid) return interaction.createMessage({
        content: url.response
    })

    const coordinates = extractCoordinatesFromUrl(url.response)

    const {lat, lng, fov, heading, pitch} = coordinates

    console.log(lat, lng, heading, pitch)

    const countryBoundingBox = await getCountryBoundingBox("South Africa");
    console.log(countryBoundingBox)
    const difLat = countryBoundingBox.maxLat - countryBoundingBox.minLat;
    const difLng = countryBoundingBox.maxLon - countryBoundingBox.minLon;

    console.log(lat, lng)

    const latRatio = (lat - countryBoundingBox.minLat) / difLat;
    const lngRatio = (lng - countryBoundingBox.minLon) / difLng;

    console.log(latRatio, lngRatio)



    const width = 1600;
    const height = 900;
    const canvas = await createCanvas(width, height);

    const ctx = await canvas.getContext("2d");

    ctx.fillStyle = "white";
    await ctx.fillRect(0, 0, width, height);
    const svg = await loadImage('assets/img/countrySvg/SouthAfrica.svg');

    const x = 974;
    const y = 464;

    const imageBuffer = await fetchStreetViewImage(lat, lng, heading, pitch, fov);
    const canvasBuffer = await createCanvasImage(imageBuffer);
    const image = await loadImage(canvasBuffer);

    const streetviewImage = {
        data: image,
        width: image.width,
        height: image.height,
        offset: {
            x: 800,
            y: 26
        }
    }
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(streetviewImage.offset.x + 50, streetviewImage.offset.y);
    ctx.lineTo(streetviewImage.offset.x + streetviewImage.width - 50, streetviewImage.offset.y);
    ctx.quadraticCurveTo(streetviewImage.offset.x + streetviewImage.width, streetviewImage.offset.y, streetviewImage.offset.x + streetviewImage.width, streetviewImage.offset.y + 50);
    ctx.lineTo(streetviewImage.offset.x + streetviewImage.width, streetviewImage.offset.y + streetviewImage.height - 50);
    ctx.quadraticCurveTo(streetviewImage.offset.x + streetviewImage.width, streetviewImage.offset.y + streetviewImage.height, streetviewImage.offset.x + streetviewImage.width - 50, streetviewImage.offset.y + streetviewImage.height);
    ctx.lineTo(streetviewImage.offset.x + 50, streetviewImage.offset.y + streetviewImage.height);
    ctx.quadraticCurveTo(streetviewImage.offset.x, streetviewImage.offset.y + streetviewImage.height, streetviewImage.offset.x, streetviewImage.offset.y + streetviewImage.height - 50);
    ctx.lineTo(streetviewImage.offset.x, streetviewImage.offset.y + 50);
    ctx.quadraticCurveTo(streetviewImage.offset.x, streetviewImage.offset.y, streetviewImage.offset.x + 50, streetviewImage.offset.y);
    ctx.closePath();

    ctx.clip();
    await ctx.drawImage(streetviewImage.data, streetviewImage.offset.x, streetviewImage.offset.y, streetviewImage.width, streetviewImage.height);
    ctx.restore();

    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 250;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 40;

    ctx.drawImage(svg, x, y, svg.width, svg.height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "black";

    ctx.fillStyle = '#DEA1B7';

    ctx.beginPath();
    ctx.arc(x+svg.width* (lngRatio)+(1+1.3/difLng) , y+svg.height* (1-latRatio)/(1+2.2/difLat), 20, 0, Math.PI * 2, true);

    ctx.fill();
    ctx.fillStyle = '#DC0150';

    ctx.beginPath();
    ctx.arc(x+svg.width* (lngRatio)+(1+1.3/difLng) , y+svg.height* (1-latRatio)/(1+2.2/difLat), 14, 0, Math.PI * 2, true);

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
    ctx.fillText("South Africa", 44, 51+82);

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
            name: "text",
            description: "text",
            required: true
        },
    ]
}