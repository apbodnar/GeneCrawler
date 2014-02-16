var canvas;
var crawler;
var renderer;

var gravity = vec3.fromValues(0,-0.05,0);
var k = 200.0;
var friction = 0.5;
var time = 0;
var dt = 0.05;

function spawn(){
	
}

function move(){
	calcAccel();
	calcPosition();
	resetAccel();
}

function integrate(node){
	 //eyeballin' it with homemade damper
	var m = node.mass;
	var p = node.p;
	var v = node.v;
	var a = vec3.scale(vec3.create(),node.a,1/m);
	
	var damper = 1-Math.atan(vec3.length(a)/1000)/(Math.PI/2);
	vec3.add(v,v,vec3.scale(vec3.create,vec3.add(a,a,[0,Math.sin(p[1]),0]),dt));
	//vec3.add(v,v,vec3.scale(vec3.create,a,dt));
	vec3.scale(v,v,damper);
	vec3.add(p,p,vec3.scale(vec3.create(),v,dt));
}

function calcAccel(){
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

function calcPosition(){
	var origin = crawler.core.origin;
	//console.log(crawler.core.origin.a)
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

function resetAccel(){
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
	renderer.drawCrawler(crawler);
};
