var canvas;
var crawler;
var renderer;

var gravity = 1.0;
var friction = 0.5;

function spawn(){
	
}

function move(){
	for(var i=0; i<crawler.segment_ids.length; i++){
		for(var j=0; j<crawler.segment_ids[i].length; j++){
			var id1 = crawler.segment_ids[i][j];
			id1 && drawSegment(crawler, id1);
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
	renderer.drawCrawler(crawler);
};