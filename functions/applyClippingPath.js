module.exports = (ctx, imageProps) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imageProps.offset.x + 50, imageProps.offset.y);
    ctx.lineTo(imageProps.offset.x + imageProps.width - 50, imageProps.offset.y);
    ctx.quadraticCurveTo(imageProps.offset.x + imageProps.width, imageProps.offset.y, imageProps.offset.x + imageProps.width, imageProps.offset.y + 50);
    ctx.lineTo(imageProps.offset.x + imageProps.width, imageProps.offset.y + imageProps.height - 50);
    ctx.quadraticCurveTo(imageProps.offset.x + imageProps.width, imageProps.offset.y + imageProps.height, imageProps.offset.x + imageProps.width - 50, imageProps.offset.y + imageProps.height);
    ctx.lineTo(imageProps.offset.x + 50, imageProps.offset.y + imageProps.height);
    ctx.quadraticCurveTo(imageProps.offset.x, imageProps.offset.y + imageProps.height, imageProps.offset.x, imageProps.offset.y + imageProps.height - 50);
    ctx.lineTo(imageProps.offset.x, imageProps.offset.y + 50);
    ctx.quadraticCurveTo(imageProps.offset.x, imageProps.offset.y, imageProps.offset.x + 50, imageProps.offset.y);
    ctx.closePath();
    ctx.clip();
}
