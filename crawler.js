function Crawler(){
	this.core = new Core;
	this.chromosome = {legs: [], segments: []};
	this.state = [];
	this.max_legs = 8;
	this.segment_ids = [];
	this.segment_pool_size = 40;
	for(var i=0; i<this.max_legs; i++){
		this.chromosome.legs.push(new Base);
		this.segment_ids.push([]);
	}
	for(var i=0; i<this.segment_pool_size; i++){
		this.chromosome.segments.push(new Segment);
		this.chromosome.segments[i].active && this.segment_ids[this.chromosome.segments[i].leg_id].push(i);
		this.state.push(0);
	}
	
	function constructSegment(that, id, base){
		var lid = that.chromosome.segments[id].leg_id;
		var d = that.chromosome.legs[lid].direction;
		var l = that.chromosome.segments[id].length;
		var origin = that.chromosome.segments[id].origin;
		var end = that.chromosome.segments[id].end;
		vec3.copy(origin,base);
		vec3.copy(end,vec3.add(vec3.create(),origin,vec3.scale(vec3.create(),d,l)));
	}
	
	this.constructLegs = function(that){
		for(var i=0; i<that.segment_ids.length; i++){
			var id0 = that.segment_ids[i][0];
			id0 && constructSegment(that, id0, that.core.origin)
			for(var j=1; j<that.segment_ids[i].length; j++){
				var id1 = that.segment_ids[i][j];
				var id2 = that.segment_ids[i][j-1];
				var pend = that.chromosome.segments[id2].end;
				constructSegment(that, id1, pend)
			}
		}
	}(this);
	
	console.log(this);
}

function Core(){
	this.width = 0.2;
	this.origin = vec3.create();
	vec3.set(this.origin,0,0,-8)
}

function Base(){
	this.active = Math.random() > 0.33 ? false : true;
	this.xaxis = Math.random()*2-1;
	this.yaxis = Math.random()*2-1;
	this.zaxis = Math.random()*2-1;
	this.xdir = Math.random()*2-1;
	this.ydir = Math.random()*2-1;
	this.zdir = Math.random()*2-1;
	this.angle = Math.random()*Math.PI*2;
	this.axis = vec3.create();
	vec3.set(this.axis,this.xaxis,this.yaxis,this.zaxis);
	vec3.normalize(this.axis,this.axis);
	this.direction = vec3.create();
	vec3.set(this.direction,this.xdir,this.ydir,this.zdir);
	vec3.normalize(this.direction,this.direction);
}

function Segment(){
	this.active = Math.random() > 0.5 ? false : true;
	this.length = Math.random() + 0.1;
	this.leg_id = Math.floor(Math.random()*8);
	this.range = Math.random()*Math.PI;
	this.period = Math.random();
	this.xaxis = Math.random()*2-1;
	this.yaxis = Math.random()*2-1;
	this.zaxis = Math.random()*2-1;
	this.axis = vec3.create();
	vec3.set(this.axis,this.xaxis,this.yaxis,this.zaxis);
	vec3.normalize(this.axis,this.axis);
	this.origin = vec3.create();
	this.end = vec3.create();
}

