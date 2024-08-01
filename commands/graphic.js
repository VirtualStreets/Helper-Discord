const Eris = require("eris");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fetchStreetViewImage = require("../functions/fetchStreetViewImage");

registerFont('Inter.ttc', { family: 'Inter', weight: 'bold' })

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


    const lat = 42.8462874;
    const lng = 2.7746311;
    const heading = 34;
    const pitch = 10;

    // const imageBuffer = await fetchStreetViewImage(lat, lng, heading, pitch);
    // const canvasBuffer = await createCanvasImage(imageBuffer);


    const width = 1600;
    const height = 900;
    const canvas = await createCanvas(width, height);
    // const image = await loadImage(canvasBuffer);

    const ctx = await canvas.getContext("2d");

    ctx.fillStyle = "white";
    await ctx.fillRect(0, 0, width, height);

    // text
    ctx.fillStyle = "black";
    ctx.font = 'semibold 64px Arial'
    ctx.fillText("South Africa", 44, 51);


// // Calculate the position to center the image
//     const x = (width / 2) - (image.width / 2);
//     const y = (height / 2) - (image.height / 2);
//     ctx.beginPath();
//     ctx.moveTo(x + 50, y);
//     ctx.lineTo(x + image.width - 50, y);
//     ctx.quadraticCurveTo(x + image.width, y, x + image.width, y + 50);
//     ctx.lineTo(x + image.width, y + image.height - 50);
//     ctx.quadraticCurveTo(x + image.width, y + image.height, x + image.width - 50, y + image.height);
//     ctx.lineTo(x + 50, y + image.height);
//     ctx.quadraticCurveTo(x, y + image.height, x, y + image.height - 50);
//     ctx.lineTo(x, y + 50);
//     ctx.quadraticCurveTo(x, y, x + 50, y);
//     ctx.closePath();
//
// // Clip to the current path
//     ctx.clip();
// // Draw the image centered on the canvas
//     await ctx.drawImage(image, x, y, image.width, image.height);
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