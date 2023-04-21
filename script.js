// Select the input file element
var fileInput = document.querySelector('#file-input');
var originalHeight, originalWidth;
const sharpenSlider = document.getElementById('sharpen-slider');
let originalImageData;
// global variable to preserve original image data
// selecting the image canvas
var canvas = document.getElementById('my-image');
var ctx = canvas.getContext("2d");


var container = document.getElementById("imageContainer");




// onchage event on loading of a file which will draw image and canvas for
// original image
$('#file-input').change(function () {
  var file = this.files[0];
  var image = new Image();

  // Load the image into the canvas and resize it
  var reader = new FileReader();
  reader.onload = function (event) {
    image.src = event.target.result;
    image.onload = function () {
      let width, height;
      originalHeight = image.height;
      originalWidth = image.width;
      if (image.width > image.height) {
        var widthRatio = 500 / image.width;
        width = 500;
        height = image.height * widthRatio;
        if (height > 500) {
          var heightRatio = 500 / height;
          height = 500;
          width = width * heightRatio;
        }
      } else {
        var heightRatio = 500 / image.height;
        height = 500;
        width = image.width * heightRatio;
        if (width > 500) {
          var widthRatio = 500 / width;
          width = 500;
          height = height * widthRatio;
        }
      }
      canvas.width = width;
      canvas.height = height;
      console.log(width, height);
      container.style.height = height + 10 + "px";
      container.style.width = width + 10 + "px";
      ctx.drawImage(image, 0, 0, width, height);
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
  };
  reader.readAsDataURL(file);
});







//add eventListner to JPG and PNG download buttons
document.getElementById("imageJPG").addEventListener("click", downloadImage);
document.getElementById("imagePNG").addEventListener("click", downloadImage);

function downloadImage(event) {
  var modifiedCanvas = document.createElement('canvas');
  modifiedCanvas.width = originalWidth;
  modifiedCanvas.height = originalHeight;
  var modifiedCtx = modifiedCanvas.getContext('2d');
  modifiedCtx.drawImage(canvas, 0, 0, originalWidth, originalHeight);
  modifiedCtx.globalCompositeOperation = 'destination-in';
  modifiedCtx.rect(0, 0, originalWidth, originalHeight);
  modifiedCtx.fill();
  var downloadLink = document.createElement('a');
  if (event.target.id === 'imageJPG') {
    downloadLink.download = 'my-image.jpg';
    downloadLink.href = modifiedCanvas.toDataURL('image/jpeg');
  } else if (event.target.id === 'imagePNG') {
    downloadLink.download = 'my-image.png';
    downloadLink.href = modifiedCanvas.toDataURL('image/png');
  }
  downloadLink.click();


}


sharpenSlider.addEventListener('input', function () {
  const sharpenStrength = sharpenSlider.value / 4;
  ctx.putImageData(originalImageData, 0, 0);
  const blurredCanvas = document.createElement('canvas');
  const blurredCtx = blurredCanvas.getContext('2d');
  blurredCanvas.width = canvas.width;
  blurredCanvas.height = canvas.height;
  blurredCtx.filter = `blur(${sharpenStrength}px)`;
  blurredCtx.drawImage(canvas, 0, 0);
  const blurredImageData = blurredCtx.getImageData(0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelCount = imageData.width * imageData.height * 4;
  const weight = 1 + sharpenStrength / 100;
  for (let i = 0; i < pixelCount; i += 4) {
    imageData.data[i] += weight * (imageData.data[i] - blurredImageData.data[i]);
    imageData.data[i + 1] += weight * (imageData.data[i + 1] - blurredImageData.data[i + 1]);
    imageData.data[i + 2] += weight * (imageData.data[i + 2] - blurredImageData.data[i + 2]);
  }
  ctx.putImageData(imageData, 0, 0);
});


