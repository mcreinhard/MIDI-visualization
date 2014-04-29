var width = 1200;
var height = 700;
var radius = 15;
var stream = [];
var midi = {};
var streamIndex= 0;
var tempoMultiplier = 1;
var pedal = false;


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
      .attr("r", velocity / 5)
      .attr("opacity", 1)
      .transition()
      .duration(50)
      .attr("r", velocity / 3)
      .transition()
      .duration(2000)
      .ease("sin")
      .attr("cy", height - 50)
      .attr("r", 0)
      .attr("opacity", 0);
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
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    listenerCallback(event);
  }
  streamIndex++;
  setTimeout(handleEvents, (stream[streamIndex].time - time) / (1000 * tempoMultiplier));
};
