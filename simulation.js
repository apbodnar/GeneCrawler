var canvas;
var crawler;
var renderer;

var gravity = 1.0;
var friction = 0.5;
var time = 0;

function spawn(){
	
}

function move(){
	//crawler.core.origin[1] = time +=0.003;
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