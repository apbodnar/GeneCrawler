function Crawler(){
	this.core = new Core;
	this.chromosome = {legs: [], segments: []};
	this.state = [];
	this.max_legs = 50;
	this.segment_ids = [];
	this.segment_pool_size = 1000;
	for(var i=0; i<this.max_legs; i++){
		this.chromosome.legs.push(new Base);
		this.segment_ids.push([]);
	}
	for(var i=0; i<this.segment_pool_size; i++){
		this.chromosome.segments.push(new Segment(this.max_legs));
		this.chromosome.segments[i].active && this.segment_ids[this.chromosome.segments[i].leg_id].push(i);
		this.state.push(0);
	}
	
	function constructSegment(that, id, base){
		var lid = that.chromosome.segments[id].leg_id;
		var d = that.chromosome.legs[lid].direction;
		var l = that.chromosome.segments[id].length;
		var origin = that.chromosome.segments[id].origin;
		var end = that.chromosome.segments[id].end;
		that.chromosome.segments[id].origin = base;
		//that.chromosome.segments[id].v_origin = base.v_end;
		//that.chromosome.segments[id].a_origin = base.a_end;
		vec3.copy(origin,base);  
		vec3.copy(end,vec3.add(vec3.create(),origin,vec3.scale(vec3.create(),d,l)));
	}
	//lazy multi-reference fuckery
	this.constructLegs = function(that){
		for(var i=0; i<that.segment_ids.length; i++){
			var id0 = that.segment_ids[i][0];
			if(id0 !== undefined){
				constructSegment(that, id0, that.core.origin);
				//that.chromosome.segments[id0].v_origin = that.core.v_origin;
				//that.chromosome.segments[id0].a_origin = that.core.a_origin;
			}
			for(var j=1; j<that.segment_ids[i].length; j++){
				var id1 = that.segment_ids[i][j];
				var id2 = that.segment_ids[i][j-1];
				var pend = that.chromosome.segments[id2].end;
				constructSegment(that, id1, pend);
				that.chromosome.segments[id1].v_origin = that.chromosome.segments[id2].v_end;
				that.chromosome.segments[id1].a_origin = that.chromosome.segments[id2].a_end;

			}
		}
	}(this);
}

function Node(){
	this.p = vec3.create();
	this.v = vec3.create();
	this.a = vec3.create();
}

function Core(){
	this.width = 0.2;
	this.origin = [0,0,-20];
	this.v_origin = [0.0,0.1,0.0];
	this.a_origin = [0.0,0.0,0.0];
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
	this.axis = [this.xaxis,this.yaxis,this.zaxis];
	vec3.normalize(this.axis,this.axis);
	this.direction = [this.xdir,this.ydir,this.zdir];
	vec3.normalize(this.direction,this.direction);
}

function Segment(num_legs){
	this.active = Math.random() > 0.5 ? false : true;
	this.length = Math.random() + 0.1;
	this.leg_id = Math.floor(Math.random()*num_legs);
	this.range = Math.random()*Math.PI;
	this.period = Math.random();
	this.xaxis = Math.random()*2-1;
	this.yaxis = Math.random()*2-1;
	this.zaxis = Math.random()*2-1;
	this.axis = [this.xaxis,this.yaxis,this.zaxis];
	vec3.normalize(this.axis,this.axis);
	this.origin = vec3.create();
	this.end = vec3.create();
	this.v_origin = vec3.fromValues(0.0,0.0,0.0);
	this.v_end = vec3.fromValues(0.0,0.0,0.0);
	this.a_origin = vec3.fromValues(0.0,0.0,0.0);
	this.a_end = vec3.fromValues(0.0,0.0,0.0);
}

