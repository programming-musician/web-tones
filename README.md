# Installation
Include /bundle/web-tones.js in your page. It can be downloaded using jsDelivr CDN: \
Latest release: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones@latest/bundle/web-tones.js \
Specific relsease: \
https://cdn.jsdelivr.net/gh/programming-musician/web-tones@0.0.5/bundle/web-tones.js \
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
Class emulating phone dial pad with 12 keys with standard frequencies ([wiki](https://en.wikipedia.org/wiki/Telephone_keypad)).
See interactive example [here](https://programming-musician.github.io/web-tones/bundle/example-dialpad.html). \
![Example](https://programming-musician.github.io/web-tones/bundle/example-dialpad.png)
### Playing simple phone number
```
var dialPad = new WebTones.DialPad();
dialPad.playPhoneNumber('123-456-789');
```

## 🎹 Piano
Class emulating piano with 88 keys with standard frequencies ([wiki](https://en.wikipedia.org/wiki/Piano_key_frequencies)).
See interactive example [here](https://programming-musician.github.io/web-tones/bundle/example-piano.html). \
![Example](https://programming-musician.github.io/web-tones/bundle/example-piano.png)
### Playing simple music
```
var piano = new WebTones.Piano(simpleConsole);
var staffPlayer = new WebTones.StaffStringPlayer(piano);
staffPlayer.process('e5/16,#d5/16 | e5/16,#d5/16,e5/16,b4/16,d5/16,c5/16');
```
### Drawing music notes to canvas
```
var staffPainter = new WebTones.StaffStringPainter(canvas);
staffPainter.process('e5/16,d#5/16 | e5/16,d#5/16,e5/16,b4/16,d5/16,c5/16');
```

## 📻 Theremin
Class emulating electric theremin device ([wiki]([https://en.wikipedia.org/wiki/Piano_key_frequencies](https://en.wikipedia.org/wiki/Theremin))).
See interactive example [here](https://programming-musician.github.io/web-tones/bundle/example-theremin.html). \
![Example](https://programming-musician.github.io/web-tones/bundle/example-piano.png)
```
```
