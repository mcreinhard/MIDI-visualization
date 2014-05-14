@chordFromNotes = (noteArr) ->
  result = 0
  result |= (1 << (note %% 12)) for note in noteArr
  result

chordNotes =
  major: [[0,4,7], [0,4]]
  minor: [[0,3,7], [0,3]]
  dominant7: [[0,4,7,10], [0,4,10]]
  open7: [[0,7,10]]
  diminished7: [[0,3,6,9], [0,3,9]]
  halfdiminished7: [[0,3,6,10], [0,6,10]]
  open5: [[0,7]]
  tritone: [[0,6]]
  major7: [[0,4,7,11], [0,4,11], [0,7,11]]
  minorMajor7: [[0,3,7,11], [0,3,11]]
  minor7: [[0,3,7,10], [0,3,10]]

@chordColors =
  major: "blue"
  minor: "purple"
  dominant7: "green"
  open7: "green"
  diminished7: "red"
  halfdiminished7: "red"
  open5: "black"
  tritone: "red"
  major7: "yellow"
  minormajor7: "red"
  minor7: "orange"
  

@chords = {}

for type, patterns of chordNotes
  for chord in patterns
    for i in [0...12]
      @chords[chordFromNotes _(chord).map (x) -> x+i] = type

