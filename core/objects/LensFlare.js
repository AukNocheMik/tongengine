"use strict";

/**
 * LensFlare object can be used to simulate lens flare from lights.
 *
 * Stores a list of Flares.
 *
 * For optimal result LensFlare object should be attached to a light source.
 *
 * Works with perspective and orthographic cameras.
 *
 * @class LensFlare
 * @module Misc
 * @extends {Object3D}
 * @constructor
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author tentone
 */
function LensFlare()
{
	TONG.Mesh.call(this, TONG.Lensflare.Geometry, new TONG.MeshBasicMaterial({opacity: 0, transparent: true}));

	this.name = "lensflare";
	this.type = "LensFlare";

	this.renderOrder = Infinity;
	this.frustumCulled = false;

	this.receiveShadow = false;
	this.castShadow = false;
	
	this.elements = [];

	var positionScreen = new TONG.Vector3();

	// textures
	var tempMap = new TONG.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, TONG.RGBFormat);
	tempMap.minFilter = TONG.NearestFilter;
	tempMap.magFilter = TONG.NearestFilter;
	tempMap.wrapS = TONG.ClampToEdgeWrapping;
	tempMap.wrapT = TONG.ClampToEdgeWrapping;
	tempMap.needsUpdate = true;

	var occlusionMap = new TONG.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, TONG.RGBFormat);
	occlusionMap.minFilter = TONG.NearestFilter;
	occlusionMap.magFilter = TONG.NearestFilter;
	occlusionMap.wrapS = TONG.ClampToEdgeWrapping;
	occlusionMap.wrapT = TONG.ClampToEdgeWrapping;
	occlusionMap.needsUpdate = true;

	// material
	var geometry = TONG.Lensflare.Geometry;
	var shader = TONG.Lensflare.Shader;
	var material1a = new TONG.RawShaderMaterial(
	{
		uniforms: {
			"scale": {value: null},
			"screenPosition": {value: null}
		},
		vertexShader: [
			"precision highp float;",
			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"attribute vec3 position;",
			"void main() {",
			"	gl_Position = vec4(position.xy * scale + screenPosition.xy, screenPosition.z, 1.0);",
			"}"
		].join("\n"),
		fragmentShader: [
			"precision highp float;",
			"void main() {",
			"	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);",
			"}"
		].join("\n"),
		depthTest: true,
		depthWrite: false,
		transparent: false
	});

	var material1b = new TONG.RawShaderMaterial(
	{
		uniforms:
		{
			"map": {value: tempMap},
			"scale": {value: null},
			"screenPosition": {value: null}
		},
		vertexShader:
		[
			"precision highp float;",
			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"attribute vec3 position;",
			"attribute vec2 uv;",
			"varying vec2 vUV;",
			"void main() {",
			"	vUV = uv;",
			"	gl_Position = vec4(position.xy * scale + screenPosition.xy, screenPosition.z, 1.0);",
			"}"
		].join("\n"),
		fragmentShader:
		[
			"precision highp float;",
			"uniform sampler2D map;",
			"varying vec2 vUV;",
			"void main() {",
			"	gl_FragColor = texture2D(map, vUV);",
			"}"
		].join("\n"),
		depthTest: false,
		depthWrite: false,
		transparent: false
	});

	// the following object is used forocclusionMap generation
	var mesh1 = new TONG.Mesh(geometry, material1a);
	var shader = TONG.LensflareElement.Shader;
	var material2 = new TONG.RawShaderMaterial(
	{
		uniforms:
		{
			"map": {value: null},
			"occlusionMap": {value: occlusionMap},
			"color": {value: new TONG.Color(0xffffff)},
			"scale": {value: new TONG.Vector2()},
			"screenPosition": {value: new TONG.Vector3()}
		},
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		blending: TONG.AdditiveBlending,
		transparent: true,
		depthWrite: false
	});

	var mesh2 = new TONG.Mesh(geometry, material2);
	var scale = new TONG.Vector2();
	var screenPositionPixels = new TONG.Vector2();
	var validArea = new TONG.Box2();
	var viewport = new TONG.Vector4();

	this.onBeforeRender = function(renderer, scene, camera)
	{
		viewport.copy(renderer.getCurrentViewport());

		var invAspect = viewport.w / viewport.z;
		var halfViewportWidth = viewport.z / 2.0;
		var halfViewportHeight = viewport.w / 2.0;

		var size = 16 / viewport.w;
		scale.set(size * invAspect, size);

		validArea.min.set(viewport.x, viewport.y);
		validArea.max.set(viewport.x + (viewport.z - 16), viewport.y + (viewport.w - 16));

		// calculate position in screen space
		positionScreen.setFromMatrixPosition(this.matrixWorld);

		positionScreen.applyMatrix4(camera.matrixWorldInverse);
		positionScreen.applyMatrix4(camera.projectionMatrix);

		// horizontal and vertical coordinate of the lower left corner of the pixels to copy
		screenPositionPixels.x = viewport.x + (positionScreen.x * halfViewportWidth) + halfViewportWidth - 8;
		screenPositionPixels.y = viewport.y + (positionScreen.y * halfViewportHeight) + halfViewportHeight - 8;

		// screen cull
		if(validArea.containsPoint(screenPositionPixels))
		{
			// save current RGB to temp texture
			renderer.copyFramebufferToTexture(screenPositionPixels, tempMap);

			// render pink quad
			var uniforms = material1a.uniforms;
			uniforms.scale.value = scale;
			uniforms.screenPosition.value = positionScreen;

			renderer.renderBufferDirect(camera, null, geometry, material1a, mesh1, null);

			// copy result to occlusionMap
			renderer.copyFramebufferToTexture(screenPositionPixels, occlusionMap);

			// restore graphics
			var uniforms = material1b.uniforms;
			uniforms.scale.value = scale;
			uniforms.screenPosition.value = positionScreen;

			renderer.renderBufferDirect(camera, null, geometry, material1b, mesh1, null);

			// render elements
			var vecX = - positionScreen.x * 2;
			var vecY = - positionScreen.y * 2;

			for(var i = 0, l = this.elements.length; i < l; i++)
			{
				var element = this.elements[i];

				var uniforms = material2.uniforms;

				uniforms.color.value.copy(element.color);
				uniforms.map.value = element.texture;
				uniforms.screenPosition.value.x = positionScreen.x + vecX * element.distance;
				uniforms.screenPosition.value.y = positionScreen.y + vecY * element.distance;

				var size = element.size / viewport.w;
				var invAspect = viewport.w / viewport.z;

				uniforms.scale.value.set(size * invAspect, size);

				material2.uniformsNeedUpdate = true;

				renderer.renderBufferDirect(camera, null, geometry, material2, mesh2, null);
			}
		}
	};

	this.dispose = function()
	{
		material1a.dispose();
		material1b.dispose();
		material2.dispose();
		tempMap.dispose();
		occlusionMap.dispose();

		for(var i = 0, l = elements.length; i < l; i ++)
		{
			elements[i].texture.dispose();
		}
	};
}

LensFlare.prototype = Object.create(TONG.Mesh.prototype);

/**
 * Add texture to the lensFlare object.
 *
 * @method add
 * @param {Texture} texture Texture to be used forthe new layer.
 * @param {Number} size Size in pixels (-1 = use texture.width)
 * @param {Number} distance Distance (0-1) from light source (0=at light source)
 * @param {Color} color Texture color
 */
LensFlare.prototype.addFlare = function(texture, size, distance, color)
{
	if(size === undefined)
	{
		size = -1;
	}
	if(distance === undefined)
	{
		distance = 0;
	}
	if(color === undefined)
	{
		color = new TONG.Color(0xffffff)
	}

	distance = Math.min(distance, Math.max(0, distance));
	
	this.addElement(new TONG.LensflareElement(texture, size, distance, color));
};

LensFlare.prototype.addElement = function(element)
{
	this.elements.push(element);
};

/**
 * Serialize lensflare data to json.
 *
 * @method toJSON
 * @param {Object} meta Metadata.
 * @return {Object} Serialized data.
 */
LensFlare.prototype.toJSON = function(meta)
{
	var self = this;
	var elements = [];

	var data = TONG.Object3D.prototype.toJSON.call(this, meta);

    for(var i = 0; i < self.elements.length; i++)
    {
        var flare = {};
        flare.texture = self.elements[i].texture.toJSON(meta).uuid;
        flare.size = self.elements[i].size;
        flare.distance = self.elements[i].distance;
        flare.color = self.elements[i].color.getHex();
        elements.push(flare);
    }

	data.object.elements = elements;

	return data;
};
