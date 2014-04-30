var tempo = 500000;
var timeDivision = 120;

var parseMIDI = function(midi) {
  console.log("%o", midi);
  timeDivision = midi.timeDivision;
  var stream = [{time: 0, events:[]}];
  var time = 0;
  var index = 0;
  while(midi.track[0].event.length > 0) { // TODO: Check all track lengths
    for (var trackNum = 0; trackNum < midi.track.length; trackNum++) {
      var event = midi.track[trackNum].event;
      while(event.length > 0 && event[0].deltaTime === 0) {
        if (event[0].type === 9) {
          if (stream[index].time !== time) {
            index++;
            stream[index] = {time: time, events:[]};
          }
          stream[index].events.push({
            type: 'noteOn',
            channel: event[0].channel,
            note: event[0].data[0],
            velocity: event[0].data[1],
            track: trackNum
          });
        } else if (event[0].type === 8) {
          if (stream[index].time !== time) {
            index++;
            stream[index] = {time: time, events:[]};
          }
          stream[index].events.push({
            type: 'noteOff',
            channel: event[0].channel,
            note: event[0].data[0],
            track: trackNum
          });
        } else if (event[0].type === 11 && event[0].data[0] === 64) {
          if (stream[index].time !== time) {
            index++;
            stream[index] = {time: time, events:[]};
          }
          stream[index].events.push({
            type: 'pedal',
            channel: event[0].channel,
            value: event[0].data[1] < 64 ? false : true,
            track: trackNum
          });
        } else if (event[0].type === 255 && event[0].metaType === 81) {
          tempo = event[0].data;
        }
        event.shift();
      }
      if (event.length > 0) event[0].deltaTime--;
    }
    time += msPerTick();
  }
  for (var i = 0; i < stream.length; i++) {
    var notes = notesFromEvents(stream[i].events);
    if (notes.length > 0) {
      stream[i].notes = notes;
    }
  }
  for (var i = 0; i < stream.length - 100; i++) { // TODO: make a real bounds check
    if (stream[i].notes !== undefined) {
      var secondIndex = i + 1;
      while (stream[secondIndex].notes === undefined) secondIndex++;
      var thirdIndex = secondIndex + 1;
      while (stream[thirdIndex].notes === undefined) thirdIndex++;
      var fourthIndex = thirdIndex + 1;
      while (stream[fourthIndex].notes === undefined) fourthIndex++;
      var fourChord = chordFromNotes(stream[i].notes.concat(
        stream[secondIndex].notes, stream[thirdIndex].notes, stream[fourthIndex].notes));
      var threeChord = chordFromNotes(stream[i].notes.concat(
        stream[secondIndex].notes, stream[thirdIndex].notes));
      var twoChord = chordFromNotes(stream[i].notes.concat(stream[secondIndex].notes));
      var oneChord = chordFromNotes(stream[i].notes);
      var fourChordType = chords[fourChord];
      if (fourChordType !== undefined) {
        _.each(stream[i].events, function(event) {
          event.color = chordColors[fourChordType];
          event.colorIndex = 4;
        });
        _.each(stream[secondIndex].events, function(event) {
          event.color = chordColors[fourChordType];
          event.colorIndex = 4;
        });
        _.each(stream[thirdIndex].events, function(event) {
          event.color = chordColors[fourChordType];
          event.colorIndex = 4;
        });
        _.each(stream[fourthIndex].events, function(event) {
          event.color = chordColors[fourChordType];
          event.colorIndex = 4;
        });
        continue;
      } 
      var threeChordType = chords[threeChord];
      if (threeChordType !== undefined) {
        _.each(stream[i].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 3) {
            event.color = chordColors[threeChordType];
            event.colorIndex = 3;
          }
        });
        _.each(stream[secondIndex].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 3) {
            event.color = chordColors[threeChordType];
            event.colorIndex = 3;
          }
        });
        _.each(stream[thirdIndex].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 3) {
            event.color = chordColors[threeChordType];
            event.colorIndex = 3;
          }
        });
        continue;
      }
      var twoChordType = chords[twoChord];
      if (twoChordType !== undefined) {
        _.each(stream[i].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 2) {
            event.color = chordColors[twoChordType];
            event.colorIndex = 2;
          }
        });
        _.each(stream[secondIndex].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 2) {
            event.color = chordColors[twoChordType];
            event.colorIndex = 2;
          }
        });
        continue;
      }
      var oneChordType = chords[oneChord];
      if (oneChordType !== undefined) {
        _.each(stream[i].events, function(event) {
          if (!event.colorIndex || event.colorIndex <= 1) {
            event.color = chordColors[oneChordType];
            event.colorIndex = 1;
          }
        });
      }

    }

  }
  console.log(stream);
  return stream;
};

var msPerTick = function() {
  return Math.floor(tempo / (timeDivision));
};

var notesFromEvents = function(events) {
  var notes = [];
  for (var i = 0; i < events.length; i++) {
    if (events[i].type === 'noteOn') {
      notes.push(events[i].note);
    }
  }
  return notes;
};
