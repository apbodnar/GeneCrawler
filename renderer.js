//babymen use three.js

function Renderer(canvas){
	var gl;
	var program;
	
	var cubeBuffer;
	var normalBuffer;
    var indexBuffer;

	var MVM = mat4.create();
    var PM = mat4.create();
    var plane_res = 15;
    var plane = [];
    var plane_indices = [];
    var start = new Date().getTime();
    var elapsed = 0;
	

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
        program.pmUniform = gl.getUniformLocation(program, "PM");
        program.mvmUniform = gl.getUniformLocation(program, "MVM");
		program.widthUniform = gl.getUniformLocation(program, "width");
		program.heightUniform = gl.getUniformLocation(program, "height");
        program.timeUniform = gl.getUniformLocation(program, "time");
    }

    function generatePlane(){
    	var two_pi = Math.PI*2;
    	for(var j=0; j< plane_res; j++){
    		for(var i=0; i<plane_res; i++){
    			x = two_pi*(i/plane_res)*((plane_res+1)/plane_res);
    			y = two_pi*(j/plane_res)*((plane_res+1)/plane_res);
    			plane = plane.concat([x,y,0]);
    		}
    	}
    }

    function generateIndices(){
    	for(var j=0; j< plane_res-1; j++){
    		for(var i=0; i<plane_res-1; i++){
    			plane_indices = plane_indices.concat([i+(j*plane_res),i+((j+1)*plane_res),i+((j+1)*plane_res)+1]);
    			plane_indices = plane_indices.concat([i+((j+1)*plane_res)+1,i+(j*plane_res)+1,i+(j*plane_res)]);
    		}
    	}
    }
	
	function initBuffers() {

		generatePlane();
		generateIndices();

        cubeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);
        cubeBuffer.itemSize = 3;
        cubeBuffer.numItems = plane.length/cubeBuffer.itemSize;

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(plane_indices), gl.STATIC_DRAW);
        indexBuffer.itemSize = 1;
        indexBuffer.numItems = plane_indices.length;
    }

    function drawCube(PM ,MVM, width, length){
    	gl.uniformMatrix4fv(program.pmUniform, false, PM);
		gl.uniformMatrix4fv(program.mvmUniform, false, MVM);

		gl.uniform1f(program.widthUniform, width);
		gl.uniform1f(program.heightUniform, length);
        gl.uniform1f(program.timeUniform, time);

		gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
	
	function drawCore(crawler){
		mat4.identity(MVM);
		mat4.translate(MVM, MVM, crawler.core.origin);

        drawCube(PM, MVM, crawler.core.width, crawler.core.width);
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
		drawCube(PM, MVM, crawler.core.width/4, crawler.chromosome.segments[id].length/2 + 0.03);
	}

	function drawLegs(crawler){
		for(var i=0; i<crawler.segment_ids.length; i++){
			for(var j=0; j<crawler.segment_ids[i].length; j++){
				var id1 = crawler.segment_ids[i][j];
				(id1 !== undefined) && drawSegment(crawler, id1);
			}
		}
	};
	
	function initRenderer(canvas){
		initGL(canvas);
		initShaders();
		initBuffers();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clearColor(0.8, 0.8, 0.8, 1.0);
        gl.enable(gl.DEPTH_TEST);
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(program.vertexAttribute, cubeBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		mat4.perspective(PM, 45*(Math.PI/180), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	}
	
	this.drawCrawler = function(crawler) {
        time = new Date().getTime() - start;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawCore(crawler);
		drawLegs(crawler)
    }
	
	initRenderer(canvas);
}