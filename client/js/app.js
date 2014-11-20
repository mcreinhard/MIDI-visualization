var width = 1200;
var height = 700;
var radius = 15;
var stream = [];
var midi = {};
var streamIndex= 0;
var tempoMultiplier = 1;
var pedal = false;
var paused = false;
var delay = 1000;

var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


var listenerCallback = function(data) {
  //var now = data.now; // where we are now
  //var end = data.end; // time when song ends
  var channel = data.channel; // channel note is playing on
  var type = data.type; // 128 is noteOff, 144 is noteOn
  var note = data.note; // the note
  var velocity = data.velocity; // the velocity of the note
  var value = data.value;
  var track = data.track;
  var color = data.color;
  if (type === "noteOn") {

    svg.append("circle")
      .attr({"cx": note * 10,
             "cy": 50,
             "r": 2,
             "opacity": 1})
      .style("fill", "black")
      .transition()
      .ease("linear")
      .duration(delay)
      .attr("cy", 150)
      .transition()
      .ease("sin")
      .duration(100)
      .attr("r", velocity / 4)
      .style("fill", color)
      .each("end", function() {MIDI.noteOn(0, note, velocity, 0);})
      .transition()
      .duration(2000)
      .attr({"cy": height - 50,
             "r": 0,
             "opacity": 0})
      .remove();
    
   /* 
    svg.append("circle")
      .attr("cx", note * 10)
      .attr("cy", 50)
      .attr("r", velocity / 7)
      .attr("opacity", 1)
      .style("fill", color)
      .transition()
      .duration(50)
      .attr("r", velocity / 4)
      .transition()
      .duration(2000)
      .ease("sin")
      .attr("cy", height - 50)
      .attr("r", 0)
      .attr("opacity", 0)
      .remove();*/
  } else if (type === "noteOff") {
    setTimeout(function() {
      if (!pedal) MIDI.noteOff(0, note, 0);
    }, delay);
  } else if (type === "pedal") {
    setTimeout(function() {pedal = value;}, delay);
  }
};

var loaderCallback = function(midi) {
  window.midi = midi;
  MIDI.loadPlugin({
		soundfontUrl: "../lib/MIDI.js-dev/examples/soundfont/",
		instrument: "acoustic_grand_piano",
    callback: function() {
			var player = MIDI.Player;
      stream = parseMIDI(midi);
      $("span.length").text(stream.length);
      streamIndex = 0;
      handleEvents();
    }
  });
};

var handleEvents = function() {
  var time = stream[streamIndex].time;
  var events = stream[streamIndex].events;
  var notes = stream[streamIndex].notes;
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    listenerCallback(event);
  }
  
  streamIndex++;
  $("span.position").text(streamIndex);
  if (!paused) {
    setTimeout(handleEvents, (stream[streamIndex].time - time) / (1000 * tempoMultiplier));
  }
};


$(document).ready(function() {
  $("button.pause").on("click", function() {
    paused = true;
  });
  $("button.play").on("click", function() {
    paused = false;
    handleEvents();
  });
  $("button.setPosition").on("click", function() {
    var $positionInput = $("input.positionInput");
    if ($positionInput.val().length > 0) {
      streamIndex = parseInt($positionInput.val());
      pedal = false;
    }
    $positionInput.val("");
    $positionInput.focus();
  });
}); 
