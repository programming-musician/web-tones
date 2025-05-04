# Installation
Include /bundle/web-tones.js in your page. It can be downloaded using jsDelivr CDN: \
Newest version: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones/bundle/web-tones.js \
Specific version: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones@0.0.1/bundle/web-tones.js

Start playback in any user action.

# Examples

## Dial-pad
Class emulating phone dialpad sounds with standard frequencies ([wiki](https://en.wikipedia.org/wiki/Telephone_keypad)).\
[Example](https://programming-musician.github.io/web-tones/bundle/example-dial.html)
### Playing simple phone number
```
var phoneDialPad = new PhoneDialPad();
phoneDialPad.playPhoneNumber('123-456-789');
```

## Piano
Class emulating 88 keys piano with standard frequencies ([wiki](https://en.wikipedia.org/wiki/Piano_key_frequencies)).\
[Example](https://programming-musician.github.io/web-tones/bundle/example-piano.html)
### Playing simple music
```
var piano = new GrandPiano(simpleConsole);
var staffPlayer = new StaffStringPlayer(piano);
staffPlayer.processMusicString('e5/16,d#5/16 | e5/16,d#5/16,e5/16,b4/16,d5/16,c5/16');
```
## Drawing music notes to canvas
var staffPainter = new StaffStringPainter(canvas);
staffPainter.processMusicString('e5/16,d#5/16 | e5/16,d#5/16,e5/16,b4/16,d5/16,c5/16');
