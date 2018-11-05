"use strict";

/**
 * Copy pass can be used to copy the actual content on the composer to the screen.
 *
 * @class CopyPass
 * @module Postprocessing
 * @constructor
 */
function CopyPass()
{
	ShaderPass.call(this, TONG.CopyShader);

	this.type = "Copy";
}

CopyPass.prototype = Object.create(ShaderPass.prototype);
