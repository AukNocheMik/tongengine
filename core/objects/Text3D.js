"use strict";

/**
 * Special mesh type used to draw 3D text.
 * 
 * It receives a Font resource that is used to triangulate and extrude font data into a 3D mesh.
 * 
 * @class Text3D
 * @module Meshes
 * @param {String} text Text to be draw
 * @param {Material} material Material used to shade the superficie of the geometry
 * @param {Font} font Font
 * @param {Number} height Text height
 * @param {boolean} bevel
 * @param {Number} bevelThickness
 * @param {Number} size
 * @param {Number} curveSegments
 * @constructor
 * @extends {Mesh}
 */
function Text3D(text, material, font, height, bevel, bevelThickness, bevelSize, size, curveSegments)
{
	TONG.Mesh.call(this, undefined, material);
	this.uuid=TONG.Math.generateUUID();
	this.name = "text";
	this.type = "Text3D";

	/**
	 * Font used to draw text.
	 * @property font
	 * @type {Font}
	 */
	this.font = font !== undefined ? font : null;
	
	/**
	 * Size of the text (depth).
	 * @property size
	 * @type {Number}
	 */
	this.size = size !== undefined ? size : 1;

	/**
	 * Height of the text.
	 * @property height
	 * @type {Number}
	 */
	this.height = height !== undefined ? height : 0.5;

	/**
	 * Number of segments that compose a curve in the font.
	 * @property curveSegments
	 * @type {Number}
	 */
	this.curveSegments = curveSegments !== undefined ? curveSegments : 15;

	/**
	 * If true a bevel is added to the text.
	 * @property bevel
	 * @type {boolean}
	 */
	this.bevel = bevel !== undefined ? bevel : false;

	/**
	 * Bevel thickness.
	 * @property bevelThickness
	 * @type {Number}
	 */
	this.bevelThickness = bevelThickness !== undefined ? bevelThickness : 0.1;

	/**
	 * Bevel size.
	 * @property bevelSize
	 * @type {Number}
	 */
	this.bevelSize = bevelSize !== undefined ? bevelSize : 0.05;

	/**
	 * Text.
	 * @property text
	 * @type {String}
	 */
	this.setText(text !== undefined ? text : "text");
}

Text3D.prototype = Object.create(TONG.Mesh.prototype);

/**
 * Set font used by this text 3D instance.
 * 
 * @param {Font} font Font
 * @method setFont
 */
Text3D.prototype.setFont = function(font)
{
	if(this.font !== font)
	{
		this.font = font;
		this.updateGeometry();
	}
};

/**
 * Change text.
 * 
 * @param {String} text
 * @method setText
 */
Text3D.prototype.setText = function(text)
{
	if(this.text !== text)
	{
		this.text = text;
		this.updateGeometry();
	}
};

/**
 * Update text geometry.
 * 
 * Should be called after chaging any attribute.
 * 
 * @method updateGeometry
 */
Text3D.prototype.updateGeometry = function()
{
	if(this.font !== null)
	{
		if(this.geometry !== undefined)
		{
			this.geometry.dispose();
		}

		this.geometry = new TONG.TextBufferGeometry(this.text,
		{
			size: this.size,
			curveSegments: this.curveSegments,
			font: this.font,
			height: this.height,
			bevelEnabled: this.bevel,
			bevelSize: this.bevelSize,
			bevelThickness: this.bevelThickness
		});
		this.geometry.computeVertexNormals();
	}
};

/**
 * Clone this Text3D instance.
 * 
 * @method clone
 * @return {Text3D} Clone of this object
 */
Text3D.prototype.clone = function()
{
	return new Text3D(this.text, this.material, this.font, this.height, this.bevel, this.bevelThickness, this.bevelSize, this.size, this.curveSegments);
};

/**
 * Create JSON for object.
 * 
 * Need to backup geometry and set to undefined to avoid it being stored.
 *
 * @method toJSON
 * @param {Object} meta
 * @return {Object} json
 */
Text3D.prototype.toJSON = function(meta)
{

	var geometry = this.geometry;
	this.geometry = undefined;

	var font = this.font;
	var data = TONG.Object3D.prototype.toJSON.call(this, meta);
    font = font.toJSON(meta);
	data.object.text = this.text;
	data.object.font = font.uuid;

	data.object.size = this.size;
	data.object.curveSegments = this.curveSegments;
	data.object.height = this.height;
	data.object.bevel = this.bevel;
	data.object.bevelThickness = this.bevelThickness;
	data.object.bevelSize = this.bevelSize;

	this.geometry = geometry;

	return data;
};
TONG.Text3D=Text3D;