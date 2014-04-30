var width = 1200;
var height = 700;
var radius = 15;
var stream = [];
var midi = {};
var streamIndex= 0;
var tempoMultiplier = 1;
var pedal = false;

var intervalColors = {
  1: "orange",
  2: "yellow",
  3: "purple",
  4: "brown",
  5: "green",
  6: "red",
  7: "green",
  8: "purple",
  9: "brown",
  10: "yellow",
  11: "orange",
  12: "blue"
};

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
  if (type === "noteOn") {
    MIDI.noteOn(0, note, velocity, 0);
    svg.append("circle")
      .attr("cx", note * 10)
      .attr("cy", 50)
      .attr("r", velocity / 7)
      .attr("opacity", 1)
      .transition()
      .duration(50)
      .attr("r", velocity / 4)
      .transition()
      .duration(2000)
      .ease("sin")
      .attr("cy", height - 50)
      .attr("r", 0)
      .attr("opacity", 0)
      .remove();
  } else if (type === "noteOff") {
    if (!pedal) MIDI.noteOff(0, note, 0);
  } else if (type === "pedal") {
    pedal = value;
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
      streamIndex = 0;
      handleEvents();
    }
  });
};

var handleEvents = function() {
  var time = stream[streamIndex].time;
  var events = stream[streamIndex].events;

  var intervals = stream[streamIndex].intervals;
  if (intervals !== undefined) {
    for (var i = 0; i < intervals.length; i++) {
      svg.append("line")
        .attr({
          "x1": intervals[i].start * 10,
          "x2": intervals[i].end * 10,
          "y1": 50,
          "y2": 50,
          "opacity": 1
        })
        .style("stroke", intervalColors[intervals[i].size])
        .transition()
        .duration(50)
        .transition()
        .duration(2000)
        .ease("sin")
        .attr({
          "y1": height - 50,
          "y2": height - 50,
          "opacity": 0
        })
        .remove();
    }
  }
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    listenerCallback(event);
  }
  
  streamIndex++;
  setTimeout(handleEvents, (stream[streamIndex].time - time) / (1000 * tempoMultiplier));
};
