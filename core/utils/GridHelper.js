"use strict";

function GridHelper(size, spacing, color)
{
	this.size = (size !== undefined) ? size : 100;
	this.spacing = (spacing !== undefined) ? spacing : 1;

	TONG.LineSegments.call(this, new TONG.BufferGeometry(), new TONG.LineBasicMaterial(
	{
		color: (color !== undefined) ? color : 0x888888,
		depthWrite: false,
		transparent: true,
		opacity: 0.5
	}));
	this.update();
};

GridHelper.prototype = Object.create(TONG.LineSegments.prototype);

GridHelper.prototype.setSize = function(size)
{
	this.size = size;
};

GridHelper.prototype.setSpacing = function(spacing)
{
	this.spacing = spacing;
};

GridHelper.prototype.update = function()
{
	var geometry = this.geometry;
	geometry.removeAttribute("position");

	var divisions = Math.round(this.size / this.spacing) * 2;
	var center = divisions / 2;
	var step = this.size * 2 / divisions;
	var vertices = [];
	var colors = [];

	for(var i = 0, j = 0, k = -this.size; i <= divisions; i ++, k += step)
	{
		vertices.push(-this.size, 0, k, this.size, 0, k);
		vertices.push(k, 0, -this.size, k, 0, this.size);
	}

	geometry.addAttribute("position", new TONG.Float32BufferAttribute(vertices, 3));
};
