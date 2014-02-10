//babymen use three.js

function Renderer(canvas){
	var gl;
	var program;
	
	var cubeBuffer;
	var normalBuffer;
    var indexBuffer;
	
	var MVM = mat4.create();
    var PM = mat4.create();
	
	var cube = [
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];
	
	var normals = [
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0,  1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  0.0, -1.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 0.0, -1.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		 1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0
    ];
	
	var indices = [
		0, 1, 2,      
		0, 2, 3,   
		4, 5, 6,      
		4, 6, 7,   
		8, 9, 10,     
		8, 10, 11, 
		12, 13, 14,   
		12, 14, 15,
		16, 17, 18,   
		16, 18, 19,
		20, 21, 22,   
		20, 22, 23 
	];

    function initGL(canvas) {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
    }
	
	function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initShaders() {
        var fs = getShader(gl, "shader-fs");
        var vs = getShader(gl, "shader-vs");

        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("you broke it");
        }

        gl.useProgram(program);
        program.vertexAttribute = gl.getAttribLocation(program, "inVertex");
        gl.enableVertexAttribArray(program.vertexAttribute);
		program.normalAttribute = gl.getAttribLocation(program, "inNormal");
        gl.enableVertexAttribArray(program.normalAttribute);
        program.pmUniform = gl.getUniformLocation(program, "PM");
        program.mvmUniform = gl.getUniformLocation(program, "MVM");
		program.widthUniform = gl.getUniformLocation(program, "width");
		program.heightUniform = gl.getUniformLocation(program, "height");
    }
	
	function initBuffers() {
        cubeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
        cubeBuffer.itemSize = 3;
        cubeBuffer.numItems = 24;
		
		normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        normalBuffer.itemSize = 3;
        normalBuffer.numItems = 24;

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        indexBuffer.itemSize = 1;
        indexBuffer.numItems = 36;
    }
	
	function drawCore(crawler){
		mat4.identity(MVM);
		mat4.translate(MVM, MVM, crawler.core.origin);
		
		gl.uniformMatrix4fv(program.pmUniform, false, PM);
        gl.uniformMatrix4fv(program.mvmUniform, false, MVM);
		
		gl.uniform1f(program.widthUniform, crawler.core.width);
		gl.uniform1f(program.heightUniform, crawler.core.width);

        gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	function getAngle(a){
		var a1 = vec3.normalize(vec3.create(),a);
		var b = vec3.fromValues(0.0,1.0,0.0);
		return Math.atan2(vec3.length(vec3.cross(vec3.create(),a1,b)),a1[1]);
	}

	function drawSegment(crawler, id){
		var origin = crawler.chromosome.segments[id].origin;
		var end = crawler.chromosome.segments[id].end;
		var seg = vec3.normalize(vec3.create(),vec3.sub(vec3.create(),end,origin));
		var axis = vec3.normalize(vec3.create(),vec3.cross(vec3.create(),seg,[0.0,1.0,0.0]));
		var angle = getAngle(seg);
		var r1 = mat4.rotate(mat4.create(), mat4.create(), -angle, axis);
		mat4.identity(MVM);
		var t2 = mat4.translate(mat4.create(), mat4.create(), origin);
		var t1 = mat4.translate(mat4.create(), mat4.create(), [0,crawler.chromosome.segments[id].length/2,0]);
		
		mat4.multiply(MVM,t2,mat4.multiply(mat4.create(),r1,t1));
		
		gl.uniformMatrix4fv(program.pmUniform, false, PM);
		gl.uniformMatrix4fv(program.mvmUniform, false, MVM);

		gl.uniform1f(program.widthUniform, crawler.core.width/4);
		gl.uniform1f(program.heightUniform, crawler.chromosome.segments[id].length/2);

		gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}

	function drawLegs(crawler){
		for(var i=0; i<crawler.segment_ids.length; i++){
			for(var j=0; j<crawler.segment_ids[i].length; j++){
				var id1 = crawler.segment_ids[i][j];
				id1 && drawSegment(crawler, id1);
			}
		}
	};
	
	function initRenderer(canvas){
		initGL(canvas);
		initShaders();
		initBuffers();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(program.vertexAttribute, cubeBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(program.normalAttribute, normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		mat4.perspective(PM, 45*(Math.PI/180), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	}
	
	this.drawCrawler = function(crawler) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawCore(crawler);
		drawLegs(crawler)
    }
	
	initRenderer(canvas);
}