"use strict";

/**
 * Film pass is used to simulate a film/TV like effect.
 *
 * @class FilmPass
 * @constructor
 * @module Postprocessing
 * @author alteredq / http://alteredqualia.com/
 */
/**
 * If set true a grascale effect will be applied.
 *
 * @property grayscale
 * @type {Boolean}
 */
/**
 * Ammout of noise to be applied to the image.
 *
 * @property noiseIntensity
 * @type {Number}
 */
/**
 * Scanline intensity.
 *
 * @property scanlinesIntensity
 * @type {Number}
 */
/**
 * Number of scanline to be displayed.
 *
 * @property scanlinesCount
 * @type {Number}
 */
function FilmPass(noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale)
{
	if(TONG.FilmShader === undefined)
	{
		console.error("FilmPass relies on THREE.FilmShader");
	}

	Pass.call(this);

	this.type = "Film";

	this.uniforms = TONG.UniformsUtils.clone(TONG.FilmShader.uniforms);
	this.material = new TONG.ShaderMaterial(
	{
		uniforms: this.uniforms,
		vertexShader: TONG.FilmShader.vertexShader,
		fragmentShader: TONG.FilmShader.fragmentShader
	});

	this.uniforms.grayscale.value = (grayscale !== undefined) ? grayscale : false;
	this.uniforms.nIntensity.value = (noiseIntensity !== undefined) ? noiseIntensity : 0.35;
	this.uniforms.sIntensity.value = (scanlinesIntensity !== undefined) ? scanlinesIntensity : 0.5;
	this.uniforms.sCount.value = (scanlinesCount !== undefined) ? scanlinesCount : 512;

	this.camera = new TONG.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	this.scene  = new TONG.Scene();
	this.quad = new TONG.Mesh(new TONG.PlaneBufferGeometry(2, 2), null);
	this.quad.frustumCulled = false;
	this.scene.add(this.quad);

	//Setters and getters for uniforms
	var self = this;
	Object.defineProperties(this,
	{
		grayscale:
		{
			get: function() {return this.uniforms["grayscale"].value;},
			set: function(value) {this.uniforms["grayscale"].value = value;}
		},

		noiseIntensity:
		{
			get: function() {return this.uniforms["nIntensity"].value;},
			set: function(value) {this.uniforms["nIntensity"].value = value;}
		},

		scanlinesIntensity:
		{
			get: function() {return this.uniforms["sIntensity"].value;},
			set: function(value) {this.uniforms["sIntensity"].value = value;}
		},

		scanlinesCount:
		{
			get: function() {return this.uniforms["sCount"].value;},
			set: function(value) {this.uniforms["sCount"].value = value;}
		}
	});
};

FilmPass.prototype = Object.create(Pass.prototype);

FilmPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive, scene, camera)
{
	this.uniforms["tDiffuse"].value = readBuffer.texture;
	this.uniforms["time"].value += delta;

	this.quad.material = this.material;

	if(this.renderToScreen)
	{
		renderer.render(this.scene, this.camera);
	}
	else
	{
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);
	}
};

FilmPass.prototype.toJSON = function(meta)
{
	var data = Pass.prototype.toJSON.call(this, meta);

	data.grayscale = this.grayscale;
	data.noiseIntensity = this.noiseIntensity;
	data.scanlinesIntensity = this.scanlinesIntensity;
	data.scanlinesCount = this.scanlinesCount;

	return data;
};

