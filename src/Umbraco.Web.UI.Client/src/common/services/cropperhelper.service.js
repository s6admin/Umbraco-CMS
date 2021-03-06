/**
* @ngdoc service
* @name umbraco.services.mediaHelper
* @description A helper object used for dealing with media items
**/
function cropperHelper(umbRequestHelper) {
	var service = {
		//utill for getting either min/max aspect ratio to scale image after
		calculateAspectRatioFit : function(srcWidth, srcHeight, maxWidth, maxHeight, maximize) {
			var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];

			if(maximize){
				ratio = Math.max(ratio[0], ratio[1]);
			}else{
				ratio = Math.min(ratio[0], ratio[1]);
			}

			return { width:srcWidth*ratio, height:srcHeight*ratio, ratio: ratio};
		},

		//utill for scaling width / height given a ratio
		calculateSizeToRatio : function(srcWidth, srcHeight, ratio) {
			return { width:srcWidth*ratio, height:srcHeight*ratio, ratio: ratio};
		},

		//returns a ng-style object with top,left,width,height pixel measurements
		//expects {left,right,top,bottom} - {width,height}, {width,height}, int
		//offset is just to push the image position a number of pixels from top,left    
		convertToStyle : function(coordinates, originalSize, viewPort, offset){

			var coordinates_px = service.coordinatesToPixels(coordinates, originalSize, offset);
			var _offset = offset || 0;

			var x = coordinates.x1 + Math.abs(coordinates.x2);
			var left_of_x =  originalSize.width - (originalSize.width * x);
			var ratio = viewPort.width / left_of_x;
			
			var style = {
				position: "absolute",
				top:  -(coordinates_px.y1*ratio)+ _offset,
				left:  -(coordinates_px.x1* ratio)+ _offset,
				width: Math.floor(originalSize.width * ratio),
				height: Math.floor(originalSize.height * ratio),
				originalWidth: originalSize.width,
				originalHeight: originalSize.height,
				ratio: ratio
			};

			return style;
		},

		//returns a ng-style object with top,left,width,height pixel measurements
		//expects {left,right,top,bottom} - {width,height}, {width,height}, int
		//offset is just to push the image position a number of pixels from top,left    
		coordinatesToPixels : function(coordinates, originalSize, offset){

			var coordinates_px = {
				x1: Math.floor(coordinates.x1 * originalSize.width),
				y1: Math.floor(coordinates.y1 * originalSize.height),
				x2: Math.floor(coordinates.x2 * originalSize.width),
				y2: Math.floor(coordinates.y2 * originalSize.height)								 
			};

			return coordinates_px;
		},

		pixelsToCoordinates : function(image, width, height, offset){

			var x1_px = Math.abs(image.left-offset);
			var y1_px = Math.abs(image.top-offset);

			var x2_px = (x1_px + width) - image.width;
			var y2_px = (y1_px + height) - image.height;

			//crop coordinates in %
			var crop = {};
			crop.x1 = x1_px / image.width;
			crop.y1 = y1_px / image.height;
			crop.x2 = x2_px / image.width;
			crop.y2 = y2_px / image.height;

			return crop;
		},

		centerInsideViewPort : function(img, viewport){
			var left = viewport.width/ 2 - img.width / 2,
				top = viewport.height / 2 - img.height / 2;
			
			return {left: left, top: top};
		},

		alignToCoordinates : function(image, center, viewport){
			
			var min_left = (image.width) - (viewport.width);
			var min_top =  (image.height) - (viewport.height);

			var c_top = -(center.top * image.height) + (viewport.height / 2);
			var c_left = -(center.left * image.width) + (viewport.width / 2);

			if(c_top < -min_top){
				c_top = -min_top;
			}
			if(c_top > 0){
				c_top = 0;
			}
			if(c_left < -min_left){
				c_left = -min_left;
			}
			if(c_left > 0){
				c_left = 0;
			}
			return {left: c_left, top: c_top};
		},


		syncElements : function(source, target){
				target.height(source.height());
				target.width(source.width());

				target.css({
					"top": source[0].offsetTop,
					"left": source[0].offsetLeft
				});
		}
	};

	return service;
}

angular.module('umbraco.services').factory('cropperHelper', cropperHelper);