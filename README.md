# Installation
Include /bundle/web-tones.js in your page. It can be downloaded using jsDelivr CDN: \
Newest version: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones/bundle/web-tones.js \
Specific version: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones@0.0.2/bundle/web-tones.js \
HTML script tag can be used:
```
<script type="text/javascript" src="./web-tones.js"></script>
```
Or:
```
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/programming-musician/web-tones/bundle/web-tones.js"></script>
```

Instruments like PhoneDialPad or Piano should be created during user initiated action.

# Examples

## 📞 Dial Pad
Class emulating phone dial pad with standard ([wiki](https://en.wikipedia.org/wiki/Telephone_keypad)).
See interactive example [here](https://programming-musician.github.io/web-tones/bundle/example-dialpad.html).
### Playing simple phone number
```
var dialPad = new WebTones.DialPad();
dialPad.playPhoneNumber('123-456-789');
```

## 🎹 Piano
Class emulating 88 keys piano with standard frequencies ([wiki](https://en.wikipedia.org/wiki/Piano_key_frequencies)).
See interactive example [here](https://programming-musician.github.io/web-tones/bundle/example-piano.html).
### Playing simple music
```
var piano = new WebTones.Piano(simpleConsole);
var staffPlayer = new WebTones.StaffStringPlayer(piano);
staffPlayer.process('e5/16,d#5/16 | e5/16,d#5/16,e5/16,b4/16,d5/16,c5/16');
```
### Drawing music notes to canvas
```
var staffPainter = new WebTones.StaffStringPainter(canvas);
staffPainter.process('e5/16,d#5/16 | e5/16,d#5/16,e5/16,b4/16,d5/16,c5/16');
```

## 📻 Theremin
```
// todo
```
