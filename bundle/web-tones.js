var WebTones;
(function (WebTones) {
    var AudioPlayer = /** @class */ (function () {
        function AudioPlayer() {
            this.audioIsRunning = false;
            this.ZeroLevel = 0.0001;
            this.DefaultFrequency = 500;
        }
        AudioPlayer.prototype.initFrontStereoPlayer = function (otherAudio) {
            this.initStereoPlayer(0, 1, otherAudio);
        };
        AudioPlayer.prototype.initBackStereoPlayer = function (otherAudio) {
            this.initStereoPlayer(2, 3, otherAudio);
        };
        AudioPlayer.prototype.initStereoPlayer = function (channel1, channel2, otherAudio) {
            this.initAudioObjects([channel1, channel2], otherAudio);
        };
        AudioPlayer.prototype.startAudio = function () {
            if (!this.audioIsRunning) {
                this.audioIsRunning = true;
                this.audioOscilator.start();
            }
        };
        AudioPlayer.prototype.stopAudio = function () {
            if (this.audioIsRunning) {
                this.audioIsRunning = false;
                this.audioOscilator.stop();
            }
        };
        AudioPlayer.prototype.getCurrentTimeSec = function () {
            return this.audioContext.currentTime;
        };
        AudioPlayer.prototype.getMaxTimeSec = function () {
            var result = this.maxTimeOrCurrentSec(this.audioOscilatorSecs);
            for (var _i = 0, _a = this.audioGainSecs; _i < _a.length; _i++) {
                var audioGainSecs = _a[_i];
                result = Math.max(result, this.maxTimeOrCurrentSec(audioGainSecs));
            }
            return result;
        };
        AudioPlayer.prototype.setFrequencyChange = function (value, timeSec) {
            value = Math.max(1, Math.min(value, 99999));
            this.audioOscilator.frequency.linearRampToValueAtTime(value, timeSec);
            this.addTimeSec(this.audioOscilatorSecs, timeSec);
        };
        AudioPlayer.prototype.setGainChange = function (index, value, timeSec) {
            value = Math.max(this.ZeroLevel, Math.min(value, 1));
            this.audioGain[index].gain.linearRampToValueAtTime(value, timeSec);
            this.addTimeSec(this.audioGainSecs[index], timeSec);
        };
        AudioPlayer.prototype.muteNow = function (durationSec) {
            var timeSec = this.audioContext.currentTime;
            // todo should freq be changed
            this.audioOscilatorSecs = new Array(0);
            var currentFrequency = this.audioOscilator.frequency.value;
            this.audioOscilator.frequency.cancelScheduledValues(timeSec);
            this.audioOscilator.frequency.setValueAtTime(currentFrequency, timeSec);
            for (var index = 0; index < this.audioGain.length; index++) {
                this.audioGainSecs[index] = new Array(0);
                var currentGain = this.audioGain[index].gain.value;
                this.audioGain[index].gain.cancelScheduledValues(timeSec);
                this.audioGain[index].gain.setValueAtTime(currentGain, timeSec);
                this.setGainChange(index, 0, timeSec + durationSec);
            }
        };
        AudioPlayer.prototype.cancelAfter = function (index, timeSec) {
            this.audioGain[index].gain.cancelScheduledValues(timeSec);
        };
        AudioPlayer.prototype.cancelAfterAndHold = function (index, timeSec) {
            this.audioGain[index].gain.cancelAndHoldAtTime(timeSec);
        };
        AudioPlayer.prototype.initAudioObjects = function (channels, otherAudio) {
            if (!this.audioContext) {
                this.channels = channels;
                if (otherAudio) {
                    this.audioContext = otherAudio.audioContext;
                    this.audioMerger = otherAudio.audioMerger;
                }
                else {
                    this.audioContext = new AudioContext();
                    this.audioContext.destination.channelCount = this.audioContext.destination.maxChannelCount;
                    this.audioMerger = this.audioContext.createChannelMerger();
                    this.audioMerger.connect(this.audioContext.destination);
                }
                this.audioOscilator = this.audioContext.createOscillator();
                this.audioOscilator.type = "sine";
                this.audioOscilator.frequency.value = this.DefaultFrequency;
                this.audioOscilatorSecs = new Array(0);
                this.audioGain = new Array(this.channels.length);
                this.audioGainSecs = new Array(this.channels.length);
                for (var index = 0; index < this.audioGain.length; index++) {
                    this.audioGain[index] = this.createChannelGainNode(index);
                    this.audioGainSecs[index] = new Array(0);
                }
            }
            else
                throw "Audio objects already created.";
        };
        AudioPlayer.prototype.createChannelGainNode = function (index) {
            var channel = this.channels[index];
            var gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioMerger, 0, channel);
            gainNode.gain.value = this.ZeroLevel;
            this.audioOscilator.connect(gainNode);
            return gainNode;
        };
        AudioPlayer.prototype.addTimeSec = function (times, timeSec) {
            times.push(timeSec);
            if (times.length > 1 && times[times.length - 2] > times[times.length - 1])
                times.sort(function (n1, n2) { return n1 - n2; });
        };
        AudioPlayer.prototype.maxTimeOrCurrentSec = function (times) {
            return times.length > 0 ?
                Math.max(this.audioContext.currentTime, times[times.length - 1]) :
                this.audioContext.currentTime;
        };
        return AudioPlayer;
    }());
    WebTones.AudioPlayer = AudioPlayer;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var TonesPlayer = /** @class */ (function () {
        function TonesPlayer(console, otherTones) {
            this.console = console;
            this.audioPlayer = new WebTones.AudioPlayer();
            this.audioPlayer.initFrontStereoPlayer(otherTones === null || otherTones === void 0 ? void 0 : otherTones.audioPlayer);
        }
        TonesPlayer.prototype.startAudio = function () {
            this.audioPlayer.startAudio();
        };
        TonesPlayer.prototype.stopAudio = function () {
            this.audioPlayer.stopAudio();
        };
        TonesPlayer.prototype.getCurrentTimeSec = function () {
            return this.audioPlayer.getCurrentTimeSec();
        };
        TonesPlayer.prototype.getMaxTimeSec = function () {
            return this.audioPlayer.getMaxTimeSec();
        };
        TonesPlayer.prototype.playTone = function (timeSec, frequency, rampUpSec, rampDownSec) {
            var up2Sec = timeSec + rampUpSec / 2;
            var upSec = timeSec + rampUpSec;
            var down2Sec = timeSec + rampUpSec + rampDownSec / 2;
            var downSec = timeSec + rampUpSec + rampDownSec;
            this.audioPlayer.setFrequencyChange(frequency, timeSec);
            this.audioPlayer.setFrequencyChange(frequency, downSec);
            this.audioPlayer.setGainChange(0, 0.0, timeSec);
            this.audioPlayer.setGainChange(1, 0.0, timeSec);
            this.audioPlayer.setGainChange(0, 0.75, up2Sec);
            this.audioPlayer.setGainChange(1, 0.75, up2Sec);
            this.audioPlayer.setGainChange(0, 1.0, upSec);
            this.audioPlayer.setGainChange(1, 1.0, upSec);
            this.audioPlayer.setGainChange(0, 0.3, down2Sec);
            this.audioPlayer.setGainChange(1, 0.3, down2Sec);
            this.audioPlayer.setGainChange(0, 0.0, downSec);
            this.audioPlayer.setGainChange(1, 0.0, downSec);
        };
        TonesPlayer.prototype.muteNow = function (durationSec) {
            this.audioPlayer.muteNow(durationSec);
        };
        return TonesPlayer;
    }());
    WebTones.TonesPlayer = TonesPlayer;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var JavascriptConsole = /** @class */ (function () {
        function JavascriptConsole() {
        }
        JavascriptConsole.prototype.log = function (message) {
            console.log(message);
        };
        JavascriptConsole.prototype.info = function (message) {
            console.info(message);
        };
        JavascriptConsole.prototype.debug = function (message) {
            console.debug(message);
        };
        JavascriptConsole.prototype.error = function (message) {
            console.error(message);
        };
        JavascriptConsole.prototype.clear = function () {
            console.clear();
        };
        return JavascriptConsole;
    }());
    WebTones.JavascriptConsole = JavascriptConsole;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var NullConsole = /** @class */ (function () {
        function NullConsole() {
        }
        NullConsole.prototype.log = function (message) { };
        NullConsole.prototype.info = function (message) { };
        NullConsole.prototype.debug = function (message) { };
        NullConsole.prototype.error = function (message) { };
        NullConsole.prototype.clear = function () { };
        return NullConsole;
    }());
    WebTones.NullConsole = NullConsole;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var Instrument = /** @class */ (function () {
        function Instrument(parallelSounds, console) {
            this.console = console;
            this.tonePlayers = new Array(parallelSounds);
            for (var i = 0; i < this.tonePlayers.length; i++) {
                this.tonePlayers[i] = i == 0 ?
                    new WebTones.TonesPlayer(console) :
                    new WebTones.TonesPlayer(console, this.tonePlayers[0]);
                this.tonePlayers[i].startAudio();
            }
        }
        Instrument.prototype.startAudio = function () {
            for (var _i = 0, _a = this.tonePlayers; _i < _a.length; _i++) {
                var tonePlayer = _a[_i];
                tonePlayer.startAudio();
            }
        };
        Instrument.prototype.getCurrentTimeSec = function () {
            var tonePlayer = this.tonePlayers[0];
            return tonePlayer.getCurrentTimeSec();
        };
        Instrument.prototype.getMaxTimeSec = function () {
            var result = 0;
            for (var _i = 0, _a = this.tonePlayers; _i < _a.length; _i++) {
                var tonePlayer = _a[_i];
                result = Math.max(result, tonePlayer.getMaxTimeSec());
            }
            return result;
        };
        Instrument.prototype.playTone = function (playerIndex, timeSec, frequency, rampUpSec, rampDownSec) {
            if (playerIndex != null) {
                var tonePlayer = this.tonePlayers[playerIndex];
                tonePlayer.playTone(timeSec, frequency, rampUpSec, rampDownSec);
            }
            else
                for (var playerIndex2 = 0; playerIndex2 < this.tonePlayers.length; playerIndex2++)
                    this.playTone(playerIndex2, timeSec, frequency, rampUpSec, rampDownSec);
        };
        Instrument.prototype.muteNow = function (durationSec) {
            for (var _i = 0, _a = this.tonePlayers; _i < _a.length; _i++) {
                var tonePlayer = _a[_i];
                tonePlayer.muteNow(durationSec);
            }
        };
        return Instrument;
    }());
    WebTones.Instrument = Instrument;
})(WebTones || (WebTones = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebTones;
(function (WebTones) {
    var DialPad = /** @class */ (function (_super) {
        __extends(DialPad, _super);
        function DialPad(console) {
            var _this = _super.call(this, 2, console) || this;
            _this.keyDurationSec = 0.3;
            return _this;
        }
        DialPad.prototype.playPhoneNumber = function (phoneNumber) {
            this.muteNow(this.keyDurationSec / 2);
            var timeSec = this.getMaxTimeSec();
            for (var i = 0; i < phoneNumber.length; i++) {
                var digit = phoneNumber.charAt(i);
                timeSec += this.playNote(timeSec, digit, this.keyDurationSec);
            }
        };
        DialPad.prototype.playNote = function (timeSec, note, durationSec) {
            var freqs = DialPad.frequencies[note];
            if (freqs) {
                var rampSec = durationSec / 2;
                this.playTone(0, timeSec, freqs[0], rampSec, rampSec);
                this.playTone(1, timeSec, freqs[1], rampSec, rampSec);
            }
            return this.keyDurationSec;
        };
        DialPad.frequencies = {
            '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
            '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
            '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
            '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
        };
        return DialPad;
    }(WebTones.Instrument));
    WebTones.DialPad = DialPad;
})(WebTones || (WebTones = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebTones;
(function (WebTones) {
    var Piano = /** @class */ (function (_super) {
        __extends(Piano, _super);
        function Piano(console) {
            var _this = _super.call(this, Piano.playersCount, console) || this;
            _this.playerIndex = 0;
            return _this;
        }
        Piano.prototype.playNote = function (timeSec, note, durationSec) {
            var playerIndex = this.chooseNextPlayerIndex();
            var frequency = Piano.frequencies[note];
            var rampUpSec = Piano.rampUpSec;
            var rampDownSec = Math.max(rampUpSec, durationSec - rampUpSec);
            if (frequency && durationSec) {
                this.playTone(playerIndex, timeSec, frequency, rampUpSec, rampDownSec);
                return rampUpSec + rampDownSec;
            }
            else
                return 0;
        };
        Piano.prototype.chooseNextPlayerIndex = function () {
            var result = this.playerIndex;
            this.playerIndex = (this.playerIndex + 1) % Piano.playersCount;
            return result;
        };
        Piano.rampUpSec = 0.05;
        Piano.playersCount = 16;
        Piano.frequencies = {
            "a0": 27.50, "a#0": 29.14, "b0": 30.87,
            "c1": 32.70, "c#1": 34.65, "d1": 36.71, "d#1": 38.89, "e1": 41.20, "f1": 43.65, "f#1": 46.25, "g1": 49.00, "g#1": 51.91, "a1": 55.00, "a#1": 58.27, "b1": 61.74,
            "c2": 65.41, "c#2": 69.30, "d2": 73.42, "d#2": 77.78, "e2": 82.41, "f2": 87.31, "f#2": 92.50, "g2": 98.00, "g#2": 103.83, "a2": 110.00, "a#2": 116.54, "b2": 123.47,
            "c3": 130.81, "c#3": 138.59, "d3": 146.83, "d#3": 155.56, "e3": 164.81, "f3": 174.61, "f#3": 185.00, "g3": 196.00, "g#3": 207.65, "a3": 220.00, "a#3": 233.08, "b3": 246.94,
            "c4": 261.63, "c#4": 277.18, "d4": 293.66, "d#4": 311.13, "e4": 329.63, "f4": 349.23, "f#4": 369.99, "g4": 392.00, "g#4": 415.30, "a4": 440.00, "a#4": 466.16, "b4": 493.88,
            "c5": 523.25, "c#5": 554.37, "d5": 587.33, "d#5": 622.25, "e5": 659.25, "f5": 698.46, "f#5": 739.99, "g5": 783.99, "g#5": 830.61, "a5": 880.00, "a#5": 932.33, "b5": 987.77,
            "c6": 1046.50, "c#6": 1108.73, "d6": 1174.66, "d#6": 1244.51, "e6": 1318.51, "f6": 1396.91, "f#6": 1479.98, "g6": 1567.98, "g#6": 1661.22, "a6": 1760.00, "a#6": 1864.66, "b6": 1975.53,
            "c7": 2093.00, "c#7": 2217.46, "d7": 2349.32, "d#7": 2489.02, "e7": 2637.02, "f7": 2793.83, "f#7": 2959.96, "g7": 3135.96, "g#7": 3322.44, "a7": 3520.00, "a#7": 3729.31, "b7": 3951.07,
            "c8": 4186.09,
        };
        return Piano;
    }(WebTones.Instrument));
    WebTones.Piano = Piano;
})(WebTones || (WebTones = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebTones;
(function (WebTones) {
    var Thermin = /** @class */ (function (_super) {
        __extends(Thermin, _super);
        function Thermin(console) {
            return _super.call(this, 1, console) || this;
        }
        Thermin.prototype.playNote = function (timeSec, note, durationSec) {
            throw new Error("Method not implemented.");
        };
        return Thermin;
    }(WebTones.Instrument));
    WebTones.Thermin = Thermin;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var StaffString = /** @class */ (function () {
        function StaffString() {
        }
        StaffString.prototype.setCarret = function (carret) {
            this.carret = carret;
        };
        StaffString.prototype.process = function (music) {
            var totalChars = 0;
            var totalDurationSec = 0;
            var chords = music.split(/\s/);
            for (var c = 0; c < chords.length; c++) {
                totalChars += c > 0 ? 1 : 0;
                this.chordBegin();
                var notes = chords[c].split(':');
                var chordDurationSec = 0;
                for (var n = 0; n < notes.length; n++) {
                    totalChars += n > 0 ? 1 : 0;
                    this.chordSubBegin();
                    var subDurationSec = 0;
                    var subNotes = notes[n].split(',');
                    for (var s = 0; s < subNotes.length; s++) {
                        totalChars += s > 0 ? 1 : 0;
                        if (this.carret >= totalChars && this.carret < totalChars + subNotes[s].length)
                            this.processCarret();
                        totalChars += subNotes[s].length;
                        subDurationSec += this.playNoteString(totalDurationSec + subDurationSec, subNotes[s]);
                    }
                    this.chordSubEnd();
                    chordDurationSec = Math.max(chordDurationSec, subDurationSec);
                }
                this.chordEnd();
                totalDurationSec += chordDurationSec;
                totalDurationSec += this.processSpace();
            }
            this.prevMusic = music;
            return totalDurationSec;
        };
        StaffString.prototype.playNoteString = function (timeSec, note) {
            var parts = note.trim().split('/');
            var noteName = parts[0];
            var noteDiv = parts.length == 2 ? new Number(parts[1]).valueOf() : 1;
            return this.processNote(timeSec, noteName, noteDiv);
        };
        StaffString.prototype.chordBegin = function () {
        };
        StaffString.prototype.chordEnd = function () {
        };
        StaffString.prototype.chordSubBegin = function () {
        };
        StaffString.prototype.chordSubEnd = function () {
        };
        StaffString.prototype.processCarret = function () {
        };
        StaffString.prototype.processNote = function (timeSec, note, noteDiv) {
            return 0;
        };
        StaffString.prototype.processSpace = function () {
            return 0;
        };
        return StaffString;
    }());
    WebTones.StaffString = StaffString;
})(WebTones || (WebTones = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebTones;
(function (WebTones) {
    var StaffStringPainter = /** @class */ (function (_super) {
        __extends(StaffStringPainter, _super);
        function StaffStringPainter(canvas) {
            var _this = _super.call(this) || this;
            _this.stuffIndex = -1;
            _this.noteSelected = false;
            _this.notesDrawn = 0;
            _this.noteWidth = 10;
            _this.lineHeight = 10;
            _this.flagLen = 2;
            _this.CodeA = 'a'.charCodeAt(0);
            _this.CodeC = 'c'.charCodeAt(0);
            _this.Code4 = '4'.charCodeAt(0);
            _this.LineColor = 'darkgray';
            _this.WallColor = 'black';
            _this.NoteColor = 'black';
            _this.canvas = canvas;
            _this.context = canvas.getContext('2d');
            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            return _this;
        }
        StaffStringPainter.prototype.processCarret = function () {
            this.noteSelected = true;
        };
        StaffStringPainter.prototype.processNote = function (timeSec, note, noteDiv) {
            if (this.stuffIndex < 0) {
                this.stuffIndex = 0;
                this.drawStaff();
            }
            if (note == '|') {
                this.drawWall();
                this.notesDrawn += 0.5;
            }
            else if (note == '||') {
                this.drawWall();
                this.stuffIndex++;
                this.notesDrawn = 0;
                this.notesDrawnCordStart = 0;
                this.notesDrawnCordEnd = 0;
                this.drawStaff();
            }
            else if (note == '\n') {
            }
            else {
                this.drawNote(note, noteDiv);
                this.noteSelected = false;
                this.notesDrawn += 1.0;
            }
            return 0;
        };
        StaffStringPainter.prototype.processSpace = function () {
            this.notesDrawn += 0.5;
            return 0;
        };
        StaffStringPainter.prototype.chordBegin = function () {
            this.notesDrawnCordStart = this.notesDrawn;
            this.notesDrawnCordEnd = this.notesDrawn;
        };
        StaffStringPainter.prototype.chordEnd = function () {
            this.notesDrawn = this.notesDrawnCordEnd;
        };
        StaffStringPainter.prototype.chordSubBegin = function () {
            this.notesDrawn = this.notesDrawnCordStart;
        };
        StaffStringPainter.prototype.chordSubEnd = function () {
            this.notesDrawnCordEnd = Math.max(this.notesDrawnCordEnd, this.notesDrawn);
        };
        StaffStringPainter.prototype.drawStaff = function () {
            var width = this.canvas.width;
            for (var line = 0; line < 5; line++) {
                var y1 = this.getLineY(this.stuffIndex, line);
                this.drawLine(this.LineColor, 0, y1, width, y1);
                var y2 = this.getLineY(this.stuffIndex, line - 6);
                this.drawLine(this.LineColor, 0, y2, width, y2);
            }
        };
        StaffStringPainter.prototype.drawNote = function (note, noteDiv) {
            var line = this.getNoteLine(note);
            var x = this.getNoteX();
            var y = this.getNoteY(line);
            var nw = this.noteWidth;
            var nw2 = this.noteWidth / 2;
            var rx = nw2;
            var ry = nw2 * 4 / 5;
            if (line == -1) {
                this.context.beginPath();
                this.context.moveTo(x - nw, y);
                this.context.lineTo(x + nw, y);
                this.context.strokeStyle = this.LineColor;
                this.context.stroke();
            }
            this.context.beginPath();
            this.context.ellipse(x, y, rx, ry, -Math.PI / 16, 0, Math.PI * 2);
            if (noteDiv > 2) {
                this.context.fillStyle = this.NoteColor;
                this.context.fill();
            }
            this.context.beginPath();
            if (noteDiv > 1) {
                var flagDir = line < 3 ? 1 : -1;
                var flagX = x + flagDir * nw2;
                var yt = this.getNoteY(line + flagDir * this.flagLen);
                this.context.moveTo(flagX, y);
                this.context.lineTo(flagX, yt);
                var dashes = Math.floor(noteDiv / 8);
                for (var i = 0; i < dashes; i++) {
                    this.context.moveTo(flagX, yt + flagDir * i * nw2);
                    this.context.lineTo(flagX + nw, yt + flagDir * i * nw2 + flagDir * nw2 / 2);
                }
            }
            this.context.strokeStyle = this.NoteColor;
            this.context.stroke();
            if (this.noteSelected) {
                this.context.beginPath();
                this.context.ellipse(x, y, rx * 2, ry * 2, -Math.PI / 16, 0, Math.PI * 2);
                this.context.stroke();
            }
        };
        StaffStringPainter.prototype.drawWall = function () {
            var x = this.getNoteX();
            var y1 = this.getNoteY(4);
            var y2 = this.getNoteY(-6);
            this.context.beginPath();
            this.drawLine(this.WallColor, x, y1, x, y2);
            this.context.stroke();
        };
        StaffStringPainter.prototype.drawLine = function (style, x1, y1, x2, y2) {
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.strokeStyle = style;
            this.context.stroke();
        };
        StaffStringPainter.prototype.getNoteX = function () {
            return this.noteWidth + this.notesDrawn * this.noteWidth * 1.5;
        };
        StaffStringPainter.prototype.getNoteY = function (line) {
            return this.getLineY(this.stuffIndex, line);
        };
        StaffStringPainter.prototype.getNoteLine = function (note) {
            note = note.toLowerCase();
            var n = note.charCodeAt(0);
            var o = note.charCodeAt(note.length - 1);
            return n < this.CodeC ?
                (n - this.CodeA + (o - this.Code4) * 7) / 2 + 1.5 :
                (n - this.CodeC + (o - this.Code4) * 7) / 2 - 1;
        };
        StaffStringPainter.prototype.getLineY = function (staff, line) {
            return (staff + 1) * 14 * this.lineHeight - line * this.lineHeight;
        };
        return StaffStringPainter;
    }(WebTones.StaffString));
    WebTones.StaffStringPainter = StaffStringPainter;
})(WebTones || (WebTones = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebTones;
(function (WebTones) {
    var StaffStringPlayer = /** @class */ (function (_super) {
        __extends(StaffStringPlayer, _super);
        function StaffStringPlayer(instrument) {
            var _this = _super.call(this) || this;
            _this.instrument = instrument;
            _this.timeSec = instrument.getCurrentTimeSec();
            return _this;
        }
        StaffStringPlayer.prototype.processNote = function (timeSec, note, noteDiv) {
            // todo implement tempo
            var durationSec = 3 / noteDiv;
            return this.instrument.playNote(this.timeSec + timeSec, note, durationSec);
        };
        StaffStringPlayer.prototype.processSpace = function () {
            // todo implement tempo
            return 0.01;
        };
        return StaffStringPlayer;
    }(WebTones.StaffString));
    WebTones.StaffStringPlayer = StaffStringPlayer;
})(WebTones || (WebTones = {}));
