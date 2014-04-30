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


var chordFromNotes = function(noteArr) {
  var result = 0;
  for (var i = 0; i < noteArr.length; i++) {
    result |= (1 << (noteArr[i] % 12));
  }
  return result;
};

var chords = {};
for (var i = 0; i < 12; i++) {
  var chord = chordFromNotes([i, i+4, i+7]);
  var reducedChord = chordFromNotes([i, i+4]);
  chords[chord] = "major";
  chords[reducedChord] = "major";
  chord = chordFromNotes([i, i+3, i+7]);
  reducedChord = chordFromNotes([i, i+3]);
  chords[chord] = "minor";
  chords[reducedChord] = "minor";
  chord = chordFromNotes([i, i+4, i+7, i+10]);
  reducedChord = chordFromNotes([i, i+4, i+10]);
  chords[chord] = "dominant7"; 
  chords[reducedChord] = "dominant7";
  chord = chordFromNotes([i, i+3, i+6, i+9]);
  reducedChord = chordFromNotes([i, i+3, i+9]);
  chords[chord] = "diminished7";
  chords[reducedChord] = "diminished7";
}

var chordColors = {
  major: "blue",
  minor: "purple",
  dominant7: "green",
  diminished7: "red"
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
  var color = data.color;
  if (type === "noteOn") {
    MIDI.noteOn(0, note, velocity, 0);
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
  var notes = stream[streamIndex].notes;
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    listenerCallback(event);
  }
  
  streamIndex++;
  setTimeout(handleEvents, (stream[streamIndex].time - time) / (1000 * tempoMultiplier));
};
