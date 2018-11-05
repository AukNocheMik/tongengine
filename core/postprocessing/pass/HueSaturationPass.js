"use strict";

/**
 * Hue and saturation pass.
 * 
 * @class HueSaturationPass
 * @module Postprocessing
 * @constructor
 * @param {Number} hue Hue rotation from -1 to 1
 * @param {Number} saturation Color saturation from -1  to 1
 */

function HueSaturationPass(hue, saturation)
{
	ShaderPass.call(this, TONG.HueSaturationShader);

	this.type = "HueSaturation";

	var self = this;
	Object.defineProperties(this,
	{
		hue:
		{
			get: function() {return this.uniforms["hue"].value;},
			set: function(value) {this.uniforms["hue"].value = value;}
		},

		saturation:
		{
			get: function() {return this.uniforms["saturation"].value;},
			set: function(value) {this.uniforms["saturation"].value = value;}
		}
	});

	this.hue = hue !== undefined ? hue : 0;
	this.saturation = saturation !== undefined ? saturation : 0;
}

HueSaturationPass.prototype = Object.create(ShaderPass.prototype);

/**
 * Serialize pass to json.
 *
 * @method toJSON
 * @param {Object} meta Metadata object.
 */
HueSaturationPass.prototype.toJSON = function(meta)
{
	var data = Pass.prototype.toJSON.call(this, meta);

	data.hue = this.hue;
	data.saturation = this.saturation;
	
	return data;
};