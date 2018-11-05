"use strict";

/**
 * Video texture, uses a video DOM element instead of a img element.
 * 
 * VideoTexture also provides methods for playback control.
 * 
 * @class VideoTexture
 * @constructor
 * @extends {Texture}
 * @module Textures
 * @param {Video} video
 * @param {Number} mapping
 * @param {Number} wrapS
 * @param {Number} wrapT
 * @param {Number} type
 * @param {Number} anisotropy
 */
function VideoTexture(video, mapping, wrapS, wrapT, type, anisotropy)
{
	/**
	 * Image is used to store a DOM video element.
	 * @property image
	 * @type {DOM}
	 */
	if(typeof video === "string")
	{
		this.video = new Video(video);
	}
	else if(video instanceof Video)
	{
		this.video = video;
	}

	//Super constructor
	TONG.Texture.call(this, document.createElement("video"), mapping, wrapS, wrapT, TONG.LinearFilter, TONG.LinearFilter, TONG.RGBFormat, type, anisotropy);

	//Texture control
	this.disposed = false;
	this.generateMipmaps = false;

	//Name
	this.name = "video";
	this.category = "Video";

	/**
	 * If true the video starts playing automatically.
	 * @property autoplay
	 * @default true
	 * @type {boolean}
	 */
	this.autoplay = true;

	/**
	 * If true the video plays in loop.
	 * @property loop
	 * @default true
	 * @type {boolean}
	 */
	this.loop = true;

	/**
	 * Start time in seconds.
	 * @property playbackRate
	 * @default 1.0
	 * @type {Number}
	 */
	this.playbackRate = 1.0;

	/**
	 * Video audio volume, its a values between 1.0 and 0.0
	 * @property volume
	 * @default 1.0
	 * @type {Number}
	 */
	this.volume = 1.0;

	//Video
	this.image.src = this.video.data;
	this.image.autoplay = this.autoplay;
	this.image.playbackRate = this.playbackRate;
	this.image.loop = this.loop;
	this.image.volume = this.volume;

	//Video update loop
	var texture = this;
	var video = this.image;
	function update()
	{
		if(!texture.disposed)
		{
			if(video.readyState >= video.HAVE_CURRENT_DATA)
			{
				texture.needsUpdate = true;
			}
			requestAnimationFrame(update);
		}
	};
	update();
	if(this.autoplay){
        this.image.play();
	}
}

VideoTexture.prototype = Object.create(TONG.Texture.prototype);

/**
 * Set video time in seconds.
 * 
 * @param {Number} time
 * @method setTime
 */
VideoTexture.prototype.setTime = function(time)
{
	this.image.currentTime = time;
}

/**
 * Set loop mode.
 * 
 * @param {boolean} loop
 * @method setLoop
 */
VideoTexture.prototype.setLoop = function(loop)
{
	this.loop = loop;
	this.image.loop = loop;
};

/**
 * Set video volume.
 * 
 * @param {Number} volume
 * @method setVolume
 */
VideoTexture.prototype.setVolume = function(volume)
{
	this.volume = (volume >= 0 && volume <= 1) ? volume : (volume >= 0) ? 1.0 : 0.0;
	this.image.volume = this.volume;
};

/**
 * Set autoplay value.
 *
 * If the image is already playing it will not stop playing.
 *
 * @method setAutoPlay
 * @param {boolean} value If true the video will play automatically.
 */
VideoTexture.prototype.setAutoPlay = function(value)
{
	this.autoplay = value;
	this.image.autoplay = this.autoplay;
}

/**
 * Set video playback speed.
 * 
 * @method setPlaybackRate
 * @param {Number} playbackRate
 */
VideoTexture.prototype.setPlaybackRate = function(playbackRate)
{
	this.playbackRate = playbackRate;
	this.image.playbackRate = playbackRate;
};

/**
 * Pause video playback.
 * 
 * @method pause
 */
VideoTexture.prototype.pause = function()
{
	if(!this.image.paused)
	{
		this.image.pause();
	}
};

/**
 * Start playing video.
 * 
 * @method play
 */
VideoTexture.prototype.play = function()
{
	if(this.image.paused)
	{
		this.image.play();
	}
};

/**
 * Dispose video texture.
 *
 * Stops the video and cleans the DOM video element inside the VideoTexture.
 * 
 * @method dispose
 */
VideoTexture.prototype.dispose = function()
{
    TONG.Texture.prototype.dispose.call(this);

	this.disposed = true;
	
	this.image.pause();
	this.image.src = "";
	this.image.load();
};

/**
 * Create Video texture json description.
 *
 * @method toJSON
 * @param {Object} meta
 * @return {Object} json
 */
VideoTexture.prototype.toJSON = function(meta)
{
	var data = TONG.Texture.prototype.toJSON.call(this, meta);
	var video = this.video.toJSON(meta);

	data.video = video.uuid;
	data.loop = this.loop;
	data.autoplay = this.autoplay;
	data.playbackRate = this.playbackRate;
	data.volume = this.volume;

	return data;
};
