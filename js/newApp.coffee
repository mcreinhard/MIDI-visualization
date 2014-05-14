width = window.innerWidth 
height = window.innerHeight
radius = 15
streamIndex= 0
@tempoMultiplier = 1
pedal = false
paused = false
delay = 1500
svg = null

$(document).ready ->
  $('button.pause').on 'click', -> paused = true
  $('button.play').on 'click', ->
    paused = false
    play()
  $('button.setPosition').on 'click', ->
    $positionInput = $ 'input.positionInput'
    if $positionInput.val().length > 0
      streamIndex = parseInt $positionInput.val()
      pedal = false
    $positionInput.val ''
    $positionInput.focus()

  svg = d3.select 'body'
    .append 'svg'
    .attr 'width', width
    .attr 'height', height

@loaderCallback = (midi) ->
  # window.midi = midi
  MIDI.loadPlugin
    soundfontUrl: '../lib/MIDI.js-dev/examples/soundfont/'
    instrument: 'acoustic_grand_piano'
    callback: -> 
      window.stream = parseMIDI midi
      $('span.length').text stream.length
      streamIndex = 0;
      play();

play = ->
  {time, events} = stream[streamIndex]
  listenerCallback event for event in events
  unless paused
    setTimeout play, (stream[++streamIndex].time - time) / (1000 * tempoMultiplier)
    $('span.position').text streamIndex

listenerCallback = (data) ->
  {channel, type, note, velocity, value, track, color} = data
  switch type
    when 'noteOn' 
      svg.append 'circle'
        .attr cx: note * 10, cy: 50, r: 2, opacity: 1
        .style 'fill', 'black'
        .transition()
        .ease 'linear'
        .duration delay
        .attr "cy", 200
        .transition()
        .duration 100
        .attr "r", velocity / 4
        .style "fill", color
        .each "end", -> MIDI.noteOn 0, note, velocity, 0
        .transition()
        .ease "sin"
        .duration 2000
        .attr cy: height - 50, r: 0, opacity: 0
        .remove()
    when 'noteOff' 
      setTimeout (-> MIDI.noteOff 0, note, 0 unless pedal), delay
    when 'pedal' 
      setTimeout (-> pedal = value), delay
      
