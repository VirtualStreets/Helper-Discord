const {loadImage} = require("canvas");
const applyClippingPath = require("./applyClippingPath");
module.exports = async (ctx, imageProps, imageBuffer) => {
    const image = await loadImage(imageBuffer);
    imageProps.height -= 20;
    applyClippingPath(ctx, imageProps);
    imageProps.height += 20;
    ctx.drawImage(image, imageProps.offset.x, imageProps.offset.y, imageProps.width, imageProps.height);
    ctx.restore();
}
