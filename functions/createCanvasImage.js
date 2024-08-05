const {createCanvas, loadImage} = require("canvas");
module.exports = async (imageBuffer, width, height) => {

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load the Street View image
    const image = await loadImage(imageBuffer);

    // Calculate the scale to cover the 780x530 area without deforming
    const scale = Math.max(width / image.width, height / image.height);

    // Calculate the position to center the image
    const x = (width / 2) - (image.width * scale / 2);
    const y = (height / 2) - (image.height * scale / 2);

    // Draw the image scaled and centered on the canvas
    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

    return canvas.toBuffer();
}
