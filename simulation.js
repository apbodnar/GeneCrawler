var canvas;
var crawler;
var renderer;

var gravity = -0.10;
var k = 400.0;
var time = 0;
var dt = 0.05;
var ground = -6;

function spawn(){
	
}

function move(){
	calcForce();
	calcPosition();
	resetForce();
}

function integrate(node){
	var m = node.mass;
	var p = node.p;
	var v = node.v;
	var a = vec3.scale(vec3.create(),node.a,1/m);
	
	var damper = 1-Math.atan(vec3.length(a)/500)/(Math.PI/2); //eyeballin' it with homemade damper
	//vec3.add(v,v,vec3.scale(vec3.create,vec3.add(a,a,[0,Math.sin(p[1]),0]),dt));
	vec3.add(v,v,vec3.scale(vec3.create,a,dt));
	vec3.scale(v,v,damper);
	vec3.add(p,p,vec3.scale(vec3.create(),v,dt));
}

function calcNodeVsNodeForce(){
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			var end = crawler.chromosome.segments[id].end;
			var origin = crawler.chromosome.segments[id].origin;
			var a_end = end.a;
			var a_origin = origin.a;
			var span = vec3.subtract(vec3.create(),end.p,origin.p);
			var length_eq = crawler.chromosome.segments[id].length;
			var length = vec3.length(span);
			var dir = vec3.normalize(vec3.create(),span);
			var accel = vec3.scale(vec3.create(),dir,(length_eq-length)*k);
			vec3.add(a_end,a_end,accel);
			vec3.add(a_origin,a_origin,vec3.negate(vec3.create(),accel));
		}
	}
}

function checkCollision(node){
	var dir2 = [-node.v[0],-node.v[2]];
	var mass = node.mass;
	if(node.p[1] <= ground){
		//fudge-factors everywhere
		node.v[0] *= 0.995;
		node.v[2] *= 0.995;
		node.a[1] += (node.p[1] - ground)*-400 + (-gravity*mass);
		node.v[1] = node.v[1]*0.9;
	}
}

function calcNodeVsEnvironmentForce(){
	var node = crawler.core.origin;
	var origin_a = node.a;
	var mass = node.mass;
	origin_a[1] += (gravity * mass);
	checkCollision(node);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			node = crawler.chromosome.segments[id].end;
			var end_a = node.a;
			mass = node.mass;
			end_a[1] += (gravity * mass);
			checkCollision(node);
		}
	}
}

function calcForce(){
	calcNodeVsNodeForce();
	calcNodeVsEnvironmentForce();
}

function calcPosition(){
	var origin = crawler.core.origin;
	integrate(origin);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			var end = crawler.chromosome.segments[id].end;
			integrate(end);
		}
	}
	
	//console.log(crawler.core.a_origin);
}

function resetForce(){
	vec3.set(crawler.core.origin.a,0,0,0);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			a_end = crawler.chromosome.segments[id].end.a;
			vec3.set(a_end,0,0,0);
		}
	}
}

function startSim(){
	crawler = new Crawler();
	canvas = document.getElementById("c");
	renderer = new Renderer(canvas);
	animate();
}

function animate(){
	window.requestAnimationFrame(animate);
	move();
	renderer.drawCrawler(crawler,ground);
};
