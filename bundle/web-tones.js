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
            this.volumes = [1.0, 1.0];
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
        TonesPlayer.prototype.setVolumes = function (volumes) {
            this.volumes = volumes.slice();
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
            this.audioPlayer.setGainChange(0, 0.75 * this.volumes[0], up2Sec);
            this.audioPlayer.setGainChange(1, 0.75 * this.volumes[1], up2Sec);
            this.audioPlayer.setGainChange(0, 1.0 * this.volumes[0], upSec);
            this.audioPlayer.setGainChange(1, 1.0 * this.volumes[1], upSec);
            this.audioPlayer.setGainChange(0, 0.3 * this.volumes[0], down2Sec);
            this.audioPlayer.setGainChange(1, 0.3 * this.volumes[1], down2Sec);
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
        Instrument.prototype.setVolumes = function (playerIndex, volumes) {
            if (playerIndex != null) {
                var tonePlayer = this.tonePlayers[playerIndex];
                tonePlayer.setVolumes(volumes);
            }
            else
                for (var playerIndex2 = 0; playerIndex2 < this.tonePlayers.length; playerIndex2++)
                    this.setVolumes(playerIndex2, volumes);
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
                var f1 = Piano.frequencies["a0"];
                var f2 = Piano.frequencies["c8"];
                var s = Math.sqrt(Math.sqrt((frequency - f1) / (f2 - f1)));
                this.setVolumes(playerIndex, [1.0 - s, s]);
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
            "a0": 27.50, "#a0": 29.14, "b0": 30.87,
            "c1": 32.70, "#c1": 34.65, "d1": 36.71, "#d1": 38.89, "e1": 41.20, "f1": 43.65, "#f1": 46.25, "g1": 49.00, "#g1": 51.91, "a1": 55.00, "#a1": 58.27, "b1": 61.74,
            "c2": 65.41, "#c2": 69.30, "d2": 73.42, "#d2": 77.78, "e2": 82.41, "f2": 87.31, "#f2": 92.50, "g2": 98.00, "#g2": 103.83, "a2": 110.00, "#a2": 116.54, "b2": 123.47,
            "c3": 130.81, "#c3": 138.59, "d3": 146.83, "#d3": 155.56, "e3": 164.81, "f3": 174.61, "#f3": 185.00, "g3": 196.00, "#g3": 207.65, "a3": 220.00, "#a3": 233.08, "b3": 246.94,
            "c4": 261.63, "#c4": 277.18, "d4": 293.66, "#d4": 311.13, "e4": 329.63, "f4": 349.23, "#f4": 369.99, "g4": 392.00, "#g4": 415.30, "a4": 440.00, "#a4": 466.16, "b4": 493.88,
            "c5": 523.25, "#c5": 554.37, "d5": 587.33, "#d5": 622.25, "e5": 659.25, "f5": 698.46, "#f5": 739.99, "g5": 783.99, "#g5": 830.61, "a5": 880.00, "#a5": 932.33, "b5": 987.77,
            "c6": 1046.50, "#c6": 1108.73, "d6": 1174.66, "#d6": 1244.51, "e6": 1318.51, "f6": 1396.91, "#f6": 1479.98, "g6": 1567.98, "#g6": 1661.22, "a6": 1760.00, "#a6": 1864.66, "b6": 1975.53,
            "c7": 2093.00, "#c7": 2217.46, "d7": 2349.32, "#d7": 2489.02, "e7": 2637.02, "f7": 2793.83, "#f7": 2959.96, "g7": 3135.96, "#g7": 3322.44, "a7": 3520.00, "#a7": 3729.31, "b7": 3951.07,
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
    var Theremin = /** @class */ (function (_super) {
        __extends(Theremin, _super);
        function Theremin(console) {
            return _super.call(this, 1, console) || this;
        }
        Theremin.prototype.playNote = function (timeSec, note, durationSec) {
            throw new Error("Method not implemented.");
        };
        return Theremin;
    }(WebTones.Instrument));
    WebTones.Theremin = Theremin;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var StaffString = /** @class */ (function () {
        function StaffString() {
            this.SymbolRe = /^(\|)|(\$)|([#@]?[a-g]\d\/\d{1,2})$/;
        }
        StaffString.prototype.setCarret = function (carret) {
            this.carret = carret;
        };
        StaffString.prototype.process = function (music) {
            this.symbols = [];
            var totalChars = 0;
            var chords = music.toLowerCase().split(/\s/);
            for (var c = 0; c < chords.length; c++) {
                totalChars += c > 0 ? 1 : 0;
                var notes = chords[c].split(':');
                for (var n = 0; n < notes.length; n++) {
                    totalChars += n > 0 ? 1 : 0;
                    var subNotes = notes[n].split(',');
                    for (var s = 0; s < subNotes.length; s++) {
                        totalChars += s > 0 ? 1 : 0;
                        if (subNotes[s].length > 0) {
                            if (this.SymbolRe.test(subNotes[s])) {
                                var symbol = this.createSymbol(subNotes[s]);
                                symbol.chordFirst = n == 0 && s == 0;
                                symbol.chordLast = n == notes.length - 1 && s == subNotes.length - 1;
                                symbol.seqFirst = s == 0;
                                symbol.seqLast = s == subNotes.length - 1;
                                symbol.posBegin = totalChars;
                                symbol.posEnd = totalChars + subNotes[s].length;
                                this.symbols.push(symbol);
                                totalChars = symbol.posEnd;
                            }
                            else {
                                console.warn("Unknown symbol: " + subNotes[s]);
                                totalChars = totalChars + subNotes[s].length;
                            }
                        }
                    }
                }
            }
            this.processSymbols();
        };
        StaffString.prototype.createSymbol = function (noteName) {
            var symbol = new StaffSymbol();
            var parts = noteName.trim().split('/');
            symbol.noteName = parts[0];
            symbol.noteDiv = parts.length == 2 ? new Number(parts[1]).valueOf() : 1;
            return symbol;
        };
        return StaffString;
    }());
    WebTones.StaffString = StaffString;
    var StaffSymbol = /** @class */ (function () {
        function StaffSymbol() {
        }
        return StaffSymbol;
    }());
    WebTones.StaffSymbol = StaffSymbol;
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
            _this.staffIndex = 0;
            _this.notesDrawn = 0;
            _this.notesDrawnCordStart = 0;
            _this.notesDrawnCordEnd = 0;
            _this.width = 0;
            _this.height = 0;
            _this.noteWidth = 10;
            _this.noteWidth2 = _this.noteWidth / 2;
            _this.noteWidth3 = _this.noteWidth / 3;
            _this.lineHeight = 10;
            _this.flagLen = 3;
            _this.noteFont = "bold 20px serif";
            _this.CodeA = 'a'.charCodeAt(0);
            _this.CodeC = 'c'.charCodeAt(0);
            _this.Code4 = '4'.charCodeAt(0);
            _this.LineColor = 'darkgray';
            _this.WallColor = 'black';
            _this.NoteColor = 'black';
            _this.SelectionColor = 'red';
            _this.canvas = canvas;
            _this.context = canvas.getContext('2d');
            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            return _this;
        }
        StaffStringPainter.prototype.getWidth = function () {
            return this.width;
        };
        StaffStringPainter.prototype.getHeight = function () {
            return this.height;
        };
        StaffStringPainter.prototype.processSymbols = function () {
            this.staffIndex = 0;
            this.width = 0;
            this.height = 0;
            for (var index = 0; index < this.symbols.length; index++) {
                var symbol = this.symbols[index];
                if (symbol.chordFirst) {
                    this.notesDrawnCordStart = this.notesDrawn;
                    this.notesDrawnCordEnd = this.notesDrawn;
                }
                if (symbol.seqFirst)
                    this.notesDrawn = this.notesDrawnCordStart;
                index = this.processNote(index);
                if (symbol.seqLast)
                    this.notesDrawnCordEnd = Math.max(this.notesDrawnCordEnd, this.notesDrawn);
                if (symbol.chordLast)
                    this.notesDrawn = this.notesDrawnCordEnd;
                if (symbol.chordLast)
                    this.notesDrawn += 0.5;
                if (symbol.noteName == '$')
                    this.gotoNextStaff();
            }
        };
        StaffStringPainter.prototype.processNote = function (index) {
            if (this.notesDrawn == 0)
                this.drawStaff();
            var symbol = this.symbols[index];
            if (symbol.noteName == '|' || symbol.noteName == '$') {
                this.drawWall();
                return index;
            }
            else {
                if (symbol.seqFirst && !symbol.seqLast) {
                    var index2 = this.findSeqLast(index);
                    if (index2 > -1)
                        return this.drawMultiNotes(index, index2);
                    else
                        return this.drawSingleNote(index);
                }
                else
                    return this.drawSingleNote(index);
            }
        };
        StaffStringPainter.prototype.drawStaff = function () {
            var width = this.canvas.width;
            for (var line = 0; line < 5; line++) {
                var y1 = this.getLineY(this.staffIndex, line);
                this.drawLine(this.LineColor, 0, y1, width, y1);
                var y2 = this.getLineY(this.staffIndex, line - 6);
                this.drawLine(this.LineColor, 0, y2, width, y2);
            }
        };
        StaffStringPainter.prototype.drawWall = function () {
            var x = this.getCurrentX();
            var y1 = this.getNoteY(4);
            var y2 = this.getNoteY(-6);
            this.context.beginPath();
            this.drawLine(this.WallColor, x, y1, x, y2);
            this.context.stroke();
            this.updateWidth(x);
            this.updateHeight(y2);
            this.notesDrawn += 0.5;
        };
        StaffStringPainter.prototype.drawMultiNotes = function (index1, index2) {
            var flagDir = this.getFlagDirMore(index1, index2);
            var noteX1 = this.getCurrentX();
            var noteX2 = this.getCurrentX();
            for (var i = index1; i <= index2; i++) {
                noteX2 = this.drawNote(i, flagDir);
                this.notesDrawn += 1.0;
            }
            this.drawMultiDashes(index1, index2, noteX1, noteX2, flagDir);
            return index2;
        };
        StaffStringPainter.prototype.drawSingleNote = function (index) {
            var symbol = this.symbols[index];
            var line = this.getNoteLine(symbol.noteName);
            if (line != null) {
                var flagDir = this.getFlagDir(line);
                var noteX = this.drawNote(index, flagDir);
                this.drawDashes(line, symbol.noteDiv, noteX, flagDir);
                this.notesDrawn += 1.0;
            }
            return index;
        };
        StaffStringPainter.prototype.drawNote = function (index, flagDir) {
            var symbol = this.symbols[index];
            var noteX = this.getCurrentX();
            var line = this.getNoteLine(symbol.noteName);
            if (line != null) {
                var noteY = this.getNoteY(line);
                if (symbol.noteName.indexOf('#') > -1)
                    this.drawNoteSharp(noteX, noteY);
                else if (symbol.noteName.indexOf('@') > -1)
                    this.drawNoteFlat(noteX, noteY);
                noteX = this.getCurrentX();
                if (this.carret >= symbol.posBegin && this.carret <= symbol.posEnd)
                    this.drawNoteSelection(noteX, noteY);
                this.drawMiniLines(line, noteX);
                this.drawElipse(noteX, noteY, symbol.noteDiv > 2);
                this.drawFlagPost(line, symbol.noteDiv, flagDir, noteX, noteY);
                this.updateWidth(noteX);
                this.updateHeight(noteY);
            }
            return noteX;
        };
        StaffStringPainter.prototype.drawMiniLine = function (line, x) {
            var y = this.getNoteY(line);
            this.context.beginPath();
            this.context.moveTo(x - this.noteWidth, y);
            this.context.lineTo(x + this.noteWidth, y);
            this.context.strokeStyle = this.NoteColor;
            this.context.stroke();
        };
        StaffStringPainter.prototype.drawNoteSharp = function (noteX, noteY) {
            this.context.font = this.noteFont;
            this.context.fillText("♯", noteX, noteY + this.noteWidth2);
            this.notesDrawn += 1.0;
        };
        StaffStringPainter.prototype.drawNoteFlat = function (noteX, noteY) {
            this.context.font = this.noteFont;
            this.context.strokeText("♭", noteX, noteY + this.noteWidth2);
            this.notesDrawn += 1.0;
        };
        StaffStringPainter.prototype.drawMiniLines = function (line, noteX) {
            if (line == -1)
                this.drawMiniLine(line, noteX);
            else if (line >= 5)
                for (var line2 = 5; line2 <= line; line2++)
                    this.drawMiniLine(line2, noteX);
            else if (line <= -7)
                for (var line2 = -7; line2 >= line; line2--)
                    this.drawMiniLine(line2, noteX);
        };
        StaffStringPainter.prototype.drawElipse = function (x, y, fill) {
            var rx = this.noteWidth2;
            var ry = this.noteWidth2 * 4 / 5;
            this.context.beginPath();
            this.context.ellipse(x, y, rx, ry, -Math.PI / 16, 0, Math.PI * 2);
            if (fill) {
                this.context.fillStyle = this.NoteColor;
                this.context.fill();
            }
        };
        StaffStringPainter.prototype.drawFlagPost = function (line, noteDiv, flagDir, noteX, noteY) {
            if (noteDiv > 1) {
                this.context.beginPath();
                var flagX = this.getFlagX(noteX, flagDir);
                var flagY = this.getFlagY(line, flagDir);
                this.context.moveTo(flagX, noteY);
                this.context.lineTo(flagX, flagY);
                this.context.strokeStyle = this.NoteColor;
                this.context.stroke();
            }
        };
        StaffStringPainter.prototype.drawDashes = function (line, noteDiv, noteX, flagDir) {
            var flagX = this.getFlagX(noteX, flagDir);
            var flagY = this.getFlagY(line, flagDir);
            var dashes = this.getNoteDashes(noteDiv);
            this.context.beginPath();
            for (var i = 0; i < dashes; i++) {
                var dx1 = flagX;
                var dy1 = flagY + i * flagDir * this.noteWidth;
                var dx2 = dx1 + this.noteWidth * 2 / 3;
                var dy2 = dy1 + flagDir * this.noteWidth * 3 / 2;
                var dx3 = dx2 - this.noteWidth / 5;
                var dy3 = dy2 + flagDir * this.noteWidth;
                this.context.moveTo(dx1, dy1);
                this.context.lineTo(dx2, dy2);
                this.context.lineTo(dx3, dy3);
            }
            this.context.strokeStyle = this.NoteColor;
            this.context.stroke();
        };
        StaffStringPainter.prototype.drawMultiDashes = function (index1, index2, noteX1, noteX2, flagDir) {
            var symbol1 = this.symbols[index1];
            var symbol2 = this.symbols[index2];
            var dashes = this.getNoteDashes(symbol1.noteDiv);
            var line1 = this.getNoteLine(symbol1.noteName);
            var line2 = this.getNoteLine(symbol2.noteName);
            if (line1 && line2) {
                var fx1 = this.getFlagX(noteX1, flagDir);
                var fy1 = this.getFlagY(line1, flagDir);
                var fx2 = this.getFlagX(noteX2, flagDir);
                var fy2 = this.getFlagY(line2, flagDir);
                for (var i = 0; i < dashes; i++) {
                    this.context.beginPath();
                    this.context.moveTo(fx1, fy1 + i * flagDir * this.noteWidth2);
                    this.context.lineTo(fx2, fy2 + i * flagDir * this.noteWidth2);
                    this.context.stroke();
                }
            }
        };
        StaffStringPainter.prototype.drawNoteSelection = function (noteX, noteY) {
            var rx = this.noteWidth;
            var ry = this.noteWidth * 4 / 5;
            this.context.beginPath();
            this.context.fillStyle = this.SelectionColor;
            this.context.ellipse(noteX, noteY, rx, ry, -Math.PI / 16, 0, Math.PI * 2);
            this.context.fill();
        };
        StaffStringPainter.prototype.drawLine = function (style, x1, y1, x2, y2) {
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.strokeStyle = style;
            this.context.stroke();
        };
        StaffStringPainter.prototype.gotoNextStaff = function () {
            this.staffIndex++;
            this.notesDrawn = 0;
            this.notesDrawnCordStart = 0;
            this.notesDrawnCordEnd = 0;
        };
        StaffStringPainter.prototype.findSeqLast = function (index) {
            for (var i = index + 1; i < this.symbols.length; i++)
                if (this.symbols[i].seqLast)
                    return i;
            return -1;
        };
        StaffStringPainter.prototype.getNoteLine = function (noteName) {
            if (noteName.length == 2 || noteName.length == 3) {
                var n = noteName.charCodeAt(noteName.length == 2 ? 0 : 1);
                var o = noteName.charCodeAt(noteName.length - 1);
                return n < this.CodeC ?
                    (n - this.CodeA + (o - this.Code4) * 7) / 2 + 1.5 :
                    (n - this.CodeC + (o - this.Code4) * 7) / 2 - 1;
            }
            else
                return null;
        };
        StaffStringPainter.prototype.getNoteDashes = function (noteDiv) {
            return Math.floor(noteDiv / 8);
        };
        StaffStringPainter.prototype.getCurrentX = function () {
            return this.noteWidth + this.notesDrawn * this.noteWidth * 1.5;
        };
        StaffStringPainter.prototype.getNoteY = function (line) {
            return this.getLineY(this.staffIndex, line);
        };
        StaffStringPainter.prototype.getLineY = function (staff, line) {
            return (staff + 1) * (staff == 0 ? 10 : 14) * this.lineHeight - line * this.lineHeight;
        };
        StaffStringPainter.prototype.getFlagDirMore = function (index1, index2) {
            var dirP = 0;
            var dirN = 0;
            for (var i = index1; i <= index2; i++) {
                var symbolX = this.symbols[i];
                var line = this.getNoteLine(symbolX.noteName);
                if (line != null) {
                    if (this.getFlagDir(line) > 0)
                        dirP++;
                    else
                        dirN++;
                }
            }
            return dirP >= dirN ? 1 : -1;
        };
        StaffStringPainter.prototype.getFlagDir = function (line) {
            return line > -1 && line < 3 ? 1 : -1;
        };
        StaffStringPainter.prototype.getFlagX = function (x, flagDir) {
            return x + flagDir * this.noteWidth / 2;
        };
        StaffStringPainter.prototype.getFlagY = function (line, flagDir) {
            return this.getNoteY(line + flagDir * this.flagLen);
        };
        StaffStringPainter.prototype.updateWidth = function (value) {
            this.width = Math.max(this.width, value + this.noteWidth);
        };
        StaffStringPainter.prototype.updateHeight = function (value) {
            this.height = Math.max(this.height, value + this.noteWidth);
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
        StaffStringPlayer.prototype.processSymbols = function () {
            for (var _i = 0, _a = this.symbols; _i < _a.length; _i++) {
                var symbol = _a[_i];
                if (symbol.chordFirst) {
                    this.cordStartTimeSec = this.timeSec;
                    this.cordEndTimeSec = this.timeSec;
                }
                if (symbol.seqFirst)
                    this.timeSec = this.cordStartTimeSec;
                this.processNote(symbol);
                if (symbol.seqLast)
                    this.cordEndTimeSec = Math.max(this.cordEndTimeSec, this.timeSec);
                if (symbol.chordLast)
                    this.timeSec = this.cordEndTimeSec;
                if (symbol.chordLast)
                    this.timeSec += 0.01;
            }
        };
        StaffStringPlayer.prototype.processNote = function (symbol) {
            // todo implement tempo
            var durationSec = 3 / symbol.noteDiv;
            this.timeSec += this.instrument.playNote(this.timeSec, symbol.noteName, durationSec);
        };
        return StaffStringPlayer;
    }(WebTones.StaffString));
    WebTones.StaffStringPlayer = StaffStringPlayer;
})(WebTones || (WebTones = {}));
