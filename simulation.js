var canvas;
var crawler;
var renderer;

var gravity = vec3.fromValues(0,-0.05,0);
var k = 100.0;
var friction = 0.5;
var time = 0;
var dt = 0.05;

function spawn(){
	
}

function move(){
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id1 = crawler.segment_ids[i][j];
			setAccel(id1);
		}
	}

	setPosition();
	resetAccel();
}

function integrate(a,v,p){
	vec3.add(v,v,vec3.scale(vec3.create,vec3.add(a,a,vec3.fromValues(0,0.1*Math.sin(p[1]),0)),dt));
	//vec3.scale(v,v,0.998)
	vec3.add(p,p,vec3.scale(vec3.create,v,dt));
}

function setAccel(id){
	var end = crawler.chromosome.segments[id].end;
	var origin = crawler.chromosome.segments[id].origin;

	var a_end = crawler.chromosome.segments[id].a_end;
	var a_origin = crawler.chromosome.segments[id].a_origin;

	var span = vec3.subtract(vec3.create(),end,origin);
	var length_eq = crawler.chromosome.segments[id].length;
	var length = vec3.length(span);
	var dir = vec3.normalize(vec3.create(),span);

	var accel = vec3.scale(vec3.create(),dir,(length_eq-length)*k);
	vec3.add(a_end,a_end,accel);
	vec3.add(a_origin,a_origin,vec3.negate(vec3.create(),accel));

}

function setPosition(){
	var a_end = crawler.core.a_origin;
	var v_end = crawler.core.v_origin;
	var end = crawler.core.origin;
	integrate(a_end,v_end,end);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			a_end = crawler.chromosome.segments[id].a_end;
			v_end = crawler.chromosome.segments[id].v_end;
			end = crawler.chromosome.segments[id].end;
			integrate(a_end,v_end,end);
		}
	}
}

function resetAccel(){
	var a_origin = crawler.core.a_origin;
	vec3.set(a_origin,0,0,0);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			a_end = crawler.chromosome.segments[id].a_end;
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
