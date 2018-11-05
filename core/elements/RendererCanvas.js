"use strict";

/**
 * A canvas element that also contains a thee.js webgl renderer object.
 *
 * The renderer is automatically updated to match the canvas size, it also handles the device pixel ratio.
 * 
 * @class RendererCanvas
 * @extends {Element}
 */
function RendererCanvas(parent,size)
{
	Element.call(this, parent, "div");
    size=typeof size=='undefined'?new TONG.Vector2(100, 100):size;
	/**
	 * On resize callback, called every time the container is updated.
	 *
	 * @attribute onResize
	 */
	this.onResize = null;

	/**
	 * Canvas DOM element.
	 * 
	 * @attribute canvas
	 * @type {DOM}
	 */
    this.size=size;
	this.resetCanvas();

	/**
	 * three.js WebGl renderer.
	 *
	 * @attribute renderer
	 * @type {THREE.WebGlRenderer}
	 */
	this.createRenderer();
}

RendererCanvas.prototype = Object.create(Element.prototype);

/**
 * Set on resize callback, can be usefull to update cameras and other screen space dependent objects.
 * 
 * The callback receives the width and height of the rendering canvas.
 * 
 * @method setOnResize
 * @param {Function} callback
 */
RendererCanvas.prototype.setOnResize = function(callback)
{
	this.onResize = callback;
};
/**
 * Resize the canvas to match the parent size and conside the device pixel ratio.
 *
 * @method resizeCanvas
 */
RendererCanvas.prototype.resizeCanvas = function()
{
    var width = this.size.x * window.devicePixelRatio;
    var height = this.size.y * window.devicePixelRatio;

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = this.size.x + "px";
    this.canvas.style.height = this.size.y + "px";

    if(this.onResize !== null)
    {
        this.onResize(width, height);
    }
};
/**
 * Reset the canvas DOM element.
 * 
 * Removes the current canvas and creates a new one.
 * 
 * @method resetCanvas
 */
RendererCanvas.prototype.resetCanvas = function()
{
	if(this.element.contains(this.canvas))
	{
		this.element.removeChild(this.canvas);
	}
	//this.element=document.body;
	this.canvas = document.createElement("canvas");
	this.canvas.style.position = "absolute";
	this.canvas.style.display = "block";
	this.canvas.style.top = "0px";
	this.canvas.style.left = "0px";
    //this.canvas.style.zIndex = "1";
	this.element.appendChild(this.canvas);
    this.resizeCanvas();


};

/**
 * Create WebGl renderer.
 * 
 * @method createRenderer
 */
RendererCanvas.prototype.createRenderer = function()
{
	var settings = /*Settings.render.followProject ? Editor.program : */Settings.render;
	
	//var context = this.canvas.getContext("webgl2");
	var context = null;
	
	this.renderer = new TONG.WebGLRenderer(
	{
		canvas: this.canvas,
		context: context,
		precision: "highp",
		alpha: true,
		premultipliedAlpha: true,
		antialias: settings.antialiasing,
		preserveDrawingBuffer: false,
		powerPreference: "high-performance",
		logarithmicDepthBuffer: false
	});

	this.renderer.shadowMap.enabled = settings.shadows;
	this.renderer.shadowMap.type = settings.shadowsType;
	this.renderer.shadowMap.autoUpdate = true;
	this.renderer.shadowMap.needsUpdate = false;

	this.renderer.toneMapping = settings.toneMapping;
	this.renderer.toneMappingExposure = settings.toneMappingExposure;
	this.renderer.toneMappingWhitePoint = settings.toneMappingWhitePoint;

	this.renderer.autoClear = false;
	this.renderer.autoClearColor = false;
	this.renderer.autoClearDepth = false;
	this.renderer.autoClearStencil = false;

	this.renderer.sortObjects = true;

	this.renderer.gammaFactor = 2;
	this.renderer.gammaInput = settings.gammaInput;
	this.renderer.gammaOutput = settings.gammaOutput;

	this.renderer.setSize(this.element.width, this.element.height);
};

/**
 * Create a new fresh context for this renderer.
 *
 * Deletes the canvas and creates a new one.
 *
 * This may be usefull to change some configurations in the renderer.
 * 
 * @method reloadContext
 */
RendererCanvas.prototype.reloadContext = function()
{
	this.forceContextLoss();
	this.resetCanvas();
	this.createRenderer();
};

/**
 * Force the current renderer to loose context.
 * 
 * This is achieved by using the WEBGL_lose_context extension and may not be supported by all browsers.
 * 
 * @method forceContextLoss
 */
RendererCanvas.prototype.forceContextLoss = function()
{
	try
	{
		if(this.renderer !== null)
		{
			this.renderer.dispose();
			this.renderer.forceContextLoss();
			this.renderer = null;
		}
	}
	catch(e)
	{
		this.renderer = null;
		console.log("nunuStudio: Failed to destroy WebGL context.");
	}
}



RendererCanvas.prototype.destroy = function()
{
	Element.prototype.destroy.call(this);

	this.forceContextLoss();
};

RendererCanvas.prototype.updateSize = function()
{
	Element.prototype.updateSize.call(this);

	this.resizeCanvas();
	
	this.renderer.setSize(this.size.x, this.size.y, false);
};
