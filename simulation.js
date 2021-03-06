var canvas;
var crawler;
var renderer;

var gravity = -2.4;
var k = 300;
var time = 0;
var dt = 0.03;
var ground = -6;
var segments;

function spawn(){

}

function move(){
	calcForce();
	calcPosition();
	resetForce();
}

function integrate_verlet(node){
	var m = node.mass;
	var p1 = node.p;
	var p0 = node.pp;
	var p2 = [node.p[0],node.p[1],node.p[2]];
	var f = 0.002;
	//console.log(p1 + "" + p2);
	var a = vec3.scale(vec3.create(),node.a,1/m);
	var delta = vec3.subtract(vec3.create(),vec3.scale(vec3.create(),p1,2-f),vec3.scale(p0,p0,1-f));
	//var delta = [(2-f)*p1[0] - (1-f)*p0[0],2*p1[1] - p0[1],2*p1[2] - p0[2]];
	vec3.copy(node.p,vec3.add(vec3.create(),delta,vec3.scale(vec3.create(),a,(dt*dt))));
	vec3.copy(node.pp,p2);
}

function integrate_euler(node){
	var m = node.mass;
	var p = node.p;
	var v = node.v;
	var a = vec3.scale(vec3.create(),node.a,1/m);

	var damper = 1-Math.atan(vec3.length(v)/500)/(Math.PI/2); //eyeballin' it with homemade damper
	//vec3.add(v,v,vec3.scale(vec3.create,vec3.add(a,a,[0,Math.sin(p[1]),0]),dt));
	vec3.add(v,v,vec3.scale(vec3.create,a,dt));
	vec3.scale(v,v,damper);
	vec3.add(p,p,vec3.scale(vec3.create(),v,dt));
}

function calcNodeVsNodeForce(){
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j],
				end = crawler.chromosome.segments[id].end,
				origin = crawler.chromosome.segments[id].origin,
				a_end = end.a,
				a_origin = origin.a,
				span = vec3.subtract(vec3.create(),end.p,origin.p),
				length_eq = crawler.chromosome.segments[id].length,
				length = vec3.length(span),
				dir = vec3.normalize(vec3.create(),span),
				accel = vec3.scale(vec3.create(),dir,(length_eq-length)*k);
			vec3.add(a_end,a_end,accel);
			vec3.add(a_origin,a_origin,vec3.negate(vec3.create(),accel));
		}
	}
}

function checkCollision(node){
	//var dir2 = [-node.v[0],-node.v[2]];
	var mass = node.mass;
	if(node.p[1] <= ground){
		//fudge-factors everywhere
		var l = vec2.length([node.v[0],node.v[2]])/500;
		node.v[0] *= 0.9;
		node.v[2] *= 0.9;
		node.v[1] *= 0.9;
		node.a[1] += (node.p[1] - ground)*-400 + (-gravity*mass);

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

function getSegmentAngle(before, current){
	var c = vec3.normalize(vec3.create(),before);
	var b = vec3.normalize(vec3.create(),current);
	var axis = vec3.cross(vec3.create(),c,b);
	return Math.atan2(vec3.length(axis),vec3.dot(c,b));
}

function applySegmentMotive(id,dir,theta,axis){
	var end = crawler.chromosome.segments[id].end.p;
	var f_dir = vec3.cross(vec3.create(), dir, axis);
	var strength = crawler.chromosome.segments[id].strength;
	var period = crawler.chromosome.segments[id].period;
	var offset = crawler.chromosome.segments[id].offset;
	var eq = Math.sin(time/1000/period+offset);
	vec3.normalize(f_dir,f_dir);
	vec3.scale(f_dir,f_dir,10*(eq-theta));
	var a = crawler.chromosome.segments[id].end.a;
	vec3.add(a,a,f_dir);
}

function calcSegmentMotive(){
	for(var i=0; i<crawler.segment_ids.length && crawler.segment_ids[i][0]; i++){
		var id = crawler.segment_ids[i][0];
		var s = crawler.chromosome.segments[id];
		var dir = s.dir();
		var axis = vec3.cross(vec3.create(),[0,1,0],dir);
		var angle = getSegmentAngle([0,1,0],dir);
		applySegmentMotive(id,dir,angle,axis);
		//console.log(angle);
		for(var j=1; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			var pid = crawler.segment_ids[i][j-1];
			var s = crawler.chromosome.segments[id];
			var ps = crawler.chromosome.segments[pid];
			var dir = s.dir();
			var pdir = ps.dir();
			var axis = vec3.cross(vec3.create(),pdir,dir);
			var angle = getSegmentAngle(pdir,dir);
			applySegmentMotive(id,dir,angle,axis);
		}
	}
}

function calcForce(){
	calcNodeVsNodeForce();
	calcSegmentMotive();
	calcNodeVsEnvironmentForce();
}

function calcPosition(){
	var origin = crawler.core.origin;
	integrate_euler(origin);
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id = crawler.segment_ids[i][j];
			var end = crawler.chromosome.segments[id].end;
			integrate_euler(end);
		}
	}
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
	segments = crawler.chromosome.segments;
	console.log(crawler);
	canvas = document.getElementById("c");
	renderer = new Renderer(canvas);
	animate();
}

function animate(){
	window.requestAnimationFrame(animate);
	move();
	renderer.drawCrawler(crawler,ground);
	time += dt;
};
