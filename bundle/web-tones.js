var WebTones;
(function (WebTones) {
    var AudioOutput = /** @class */ (function () {
        function AudioOutput() {
            this.audioContext = new AudioContext();
            this.audioContext.destination.channelCount = this.audioContext.destination.maxChannelCount;
            this.audioMerger = this.audioContext.createChannelMerger();
            this.audioMerger.connect(this.audioContext.destination);
        }
        return AudioOutput;
    }());
    WebTones.AudioOutput = AudioOutput;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var ChannelPlayer = /** @class */ (function () {
        function ChannelPlayer() {
            this.frequencyMaxSec = 0;
            this.volumeMaxSec = 0;
            this.audioIsRunning = false;
            this.MinVolume = 0.0001;
            this.MaxVolume = 1.0;
            this.DefaultFrequency = 500;
            this.MinFrequency = 1;
            this.MaxFrequency = 99999;
        }
        ChannelPlayer.prototype.init = function (channel, otherAudio) {
            this.initAudioObjects(channel, otherAudio);
        };
        ChannelPlayer.prototype.startAudio = function () {
            if (!this.audioIsRunning) {
                this.audioIsRunning = true;
                this.audioOscilator.start();
            }
        };
        ChannelPlayer.prototype.stopAudio = function () {
            if (this.audioIsRunning) {
                this.audioIsRunning = false;
                this.audioOscilator.stop();
            }
        };
        ChannelPlayer.prototype.getCurrentTimeSec = function () {
            return this.audioOutput.audioContext.currentTime;
        };
        ChannelPlayer.prototype.getMaxTimeSec = function () {
            return Math.max(this.frequencyMaxSec, this.volumeMaxSec, this.audioOutput.audioContext.currentTime);
        };
        ChannelPlayer.prototype.setFrequencyChange = function (timeSec, value) {
            var currentSec = this.audioOutput.audioContext.currentTime;
            if (timeSec > 0 && timeSec <= currentSec)
                console.error("TimeToSmall Frequency: " + timeSec + " <= " + currentSec + ".");
            if (this.isHoldingGap(this.frequencyMaxSec, currentSec, timeSec))
                this.setFrequencyHold();
            value = Math.max(this.MinFrequency, Math.min(value, this.MaxFrequency));
            this.audioOscilator.frequency.linearRampToValueAtTime(value, timeSec);
            this.frequencyMaxSec = Math.max(this.frequencyMaxSec, timeSec);
        };
        ChannelPlayer.prototype.setVolumeChange = function (timeSec, value) {
            var currentSec = this.audioOutput.audioContext.currentTime;
            if (timeSec > 0 && timeSec <= currentSec)
                console.error("TimeToSmall Volume: " + timeSec + " <= " + currentSec + ".");
            if (this.isHoldingGap(this.volumeMaxSec, currentSec, timeSec))
                this.setVolumeHold();
            value = Math.max(this.MinVolume, Math.min(value, this.MaxVolume));
            this.audioGain.gain.linearRampToValueAtTime(value, timeSec);
            this.volumeMaxSec = Math.max(this.volumeMaxSec, timeSec);
        };
        ChannelPlayer.prototype.muteNow = function (durationSec) {
            var timeSec = this.audioOutput.audioContext.currentTime;
            var currentGain = this.audioGain.gain.value;
            this.audioGain.gain.cancelScheduledValues(timeSec);
            this.audioGain.gain.setValueAtTime(currentGain, timeSec);
            this.setVolumeChange(timeSec + durationSec, 0);
        };
        ChannelPlayer.prototype.cancelAfter = function (index, timeSec) {
            this.audioGain[index].gain.cancelScheduledValues(timeSec);
        };
        ChannelPlayer.prototype.cancelAfterAndHold = function (index, timeSec) {
            this.audioGain[index].gain.cancelAndHoldAtTime(timeSec);
        };
        ChannelPlayer.prototype.setFrequencyHold = function () {
            var value = this.audioOscilator.frequency.value;
            var timeSec = this.audioOutput.audioContext.currentTime;
            this.audioOscilator.frequency.setValueAtTime(value, timeSec);
        };
        ChannelPlayer.prototype.setVolumeHold = function () {
            var value = this.audioGain.gain.value;
            var timeSec = this.audioOutput.audioContext.currentTime;
            this.audioGain.gain.setValueAtTime(value, timeSec);
        };
        ChannelPlayer.prototype.initAudioObjects = function (channel, otherAudio) {
            if (!this.audioOutput) {
                this.channel = channel;
                this.audioOutput = !otherAudio ? new WebTones.AudioOutput() : otherAudio;
                this.audioOscilator = this.audioOutput.audioContext.createOscillator();
                this.audioOscilator.type = "sine";
                this.audioOscilator.frequency.value = this.DefaultFrequency;
                this.audioGain = this.createChannelGainNode();
            }
            else
                throw "Audio objects already created.";
        };
        ChannelPlayer.prototype.createChannelGainNode = function () {
            var gainNode = this.audioOutput.audioContext.createGain();
            gainNode.connect(this.audioOutput.audioMerger, 0, this.channel);
            gainNode.gain.value = this.MinVolume;
            this.audioOscilator.connect(gainNode);
            return gainNode;
        };
        ChannelPlayer.prototype.isHoldingGap = function (maxSec, currentSec, timeSec) {
            return maxSec < currentSec && currentSec < timeSec;
        };
        return ChannelPlayer;
    }());
    WebTones.ChannelPlayer = ChannelPlayer;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var MultiPlayer = /** @class */ (function () {
        function MultiPlayer(channelsCount, audioOutput, console) {
            this.console = console;
            this.audioOutput = audioOutput != null ? audioOutput : new WebTones.AudioOutput();
            this.channelPlayers = [];
            for (var c = 0; c < channelsCount; c++) {
                this.channelPlayers[c] = new WebTones.ChannelPlayer();
                this.channelPlayers[c].init(c, this.audioOutput);
            }
        }
        MultiPlayer.prototype.startAudio = function () {
            for (var _i = 0, _a = this.channelPlayers; _i < _a.length; _i++) {
                var channelPlayer = _a[_i];
                channelPlayer.startAudio();
            }
        };
        MultiPlayer.prototype.stopAudio = function () {
            for (var _i = 0, _a = this.channelPlayers; _i < _a.length; _i++) {
                var channelPlayer = _a[_i];
                channelPlayer.stopAudio();
            }
        };
        MultiPlayer.prototype.getCurrentTimeSec = function () {
            return this.audioOutput.audioContext.currentTime;
        };
        MultiPlayer.prototype.getMaxTimeSec = function (channelIndex) {
            return this.channelPlayers[channelIndex].getMaxTimeSec();
        };
        MultiPlayer.prototype.getMaxTimeAllSec = function () {
            var timeSec = 0;
            for (var _i = 0, _a = this.channelPlayers; _i < _a.length; _i++) {
                var channelPlayer = _a[_i];
                timeSec = Math.max(timeSec, channelPlayer.getMaxTimeSec());
            }
            return timeSec;
        };
        MultiPlayer.prototype.muteNow = function (durationSec) {
            for (var _i = 0, _a = this.channelPlayers; _i < _a.length; _i++) {
                var channelPlayer = _a[_i];
                channelPlayer.muteNow(durationSec);
            }
        };
        MultiPlayer.prototype.setFrequencyChangeOneToOne = function (channelIndex, timeSec, level) {
            this.channelPlayers[channelIndex].setFrequencyChange(timeSec, level);
        };
        MultiPlayer.prototype.setFrequencyChangeOneToAll = function (timeSec, level) {
            for (var channelIndex = 0; channelIndex < this.channelPlayers.length; channelIndex++)
                this.channelPlayers[channelIndex].setFrequencyChange(timeSec, level);
        };
        MultiPlayer.prototype.setVolumeChangeOneToOne = function (channelIndex, timeSec, volume) {
            this.channelPlayers[channelIndex].setVolumeChange(timeSec, volume);
        };
        MultiPlayer.prototype.setVolumeChangeOneToAll = function (timeSec, volume) {
            for (var channelIndex = 0; channelIndex < this.channelPlayers.length; channelIndex++)
                this.channelPlayers[channelIndex].setVolumeChange(timeSec, volume);
        };
        MultiPlayer.prototype.setVolumeChangeAllToAll = function (timeSec, volumes, level) {
            for (var channelIndex = 0; channelIndex < this.channelPlayers.length; channelIndex++)
                this.channelPlayers[channelIndex].setVolumeChange(timeSec, volumes[channelIndex] * level);
        };
        return MultiPlayer;
    }());
    WebTones.MultiPlayer = MultiPlayer;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var StepValue = /** @class */ (function () {
        function StepValue(stepSec, value) {
            this.stepSec = stepSec;
            this.value = value;
        }
        return StepValue;
    }());
    WebTones.StepValue = StepValue;
    var Signal = /** @class */ (function () {
        function Signal() {
            this.values = [];
        }
        Signal.prototype.getTotalSec = function () {
            var result = 0;
            for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
                var v = _a[_i];
                result += v.stepSec;
            }
            return result;
        };
        return Signal;
    }());
    WebTones.Signal = Signal;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var SignalGenerator = /** @class */ (function () {
        function SignalGenerator(value) {
            this.value = 0;
            this.continue = true;
            this.value = value;
        }
        SignalGenerator.prototype.generate = function (minDurationSec) {
            console.info(this.constructor['name']);
            var signal = new WebTones.Signal();
            if (this.continue) {
                this.continue = this.generateNormalizedSignal(signal, minDurationSec);
                for (var _i = 0, _a = signal.values; _i < _a.length; _i++) {
                    var s = _a[_i];
                    s.value = this.value * Math.max(0.0, Math.min(s.value, 1.0));
                }
            }
            return signal;
        };
        SignalGenerator.prototype.shouldContinue = function () {
            return this.continue;
        };
        return SignalGenerator;
    }());
    WebTones.SignalGenerator = SignalGenerator;
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
    var SignalGenerators;
    (function (SignalGenerators) {
        var Const = /** @class */ (function (_super) {
            __extends(Const, _super);
            function Const(value) {
                return _super.call(this, value) || this;
            }
            Const.prototype.generateNormalizedSignal = function (signal, minDurationSec) {
                signal.values.push(new WebTones.StepValue(0.2, 1.0));
                return false;
            };
            return Const;
        }(WebTones.SignalGenerator));
        SignalGenerators.Const = Const;
        var SinAbs = /** @class */ (function (_super) {
            __extends(SinAbs, _super);
            function SinAbs(volume, waveSec) {
                var _this = _super.call(this, volume) || this;
                _this.waveSec = waveSec;
                return _this;
            }
            SinAbs.prototype.generateNormalizedSignal = function (signal, minDurationSec) {
                var volumesCount = this.waveSec >= 1.0 ? 16 : 8;
                var posDt = 2 * Math.PI / volumesCount;
                var stepSec = this.waveSec / volumesCount;
                for (var i = 0, pos = posDt; i < volumesCount; i++, pos += posDt) {
                    var value = Math.abs(Math.sin(pos));
                    signal.values.push(new WebTones.StepValue(stepSec, value));
                }
                return true;
            };
            return SinAbs;
        }(WebTones.SignalGenerator));
        SignalGenerators.SinAbs = SinAbs;
        var SinAbsRandom = /** @class */ (function (_super) {
            __extends(SinAbsRandom, _super);
            function SinAbsRandom(volume, waveSecMin, waveSecMax) {
                var _this = _super.call(this, volume) || this;
                _this.waveSecMin = waveSecMin;
                _this.waveSecMax = waveSecMax;
                return _this;
            }
            SinAbsRandom.prototype.generateNormalizedSignal = function (signal, minDurationSec) {
                var durationSec = this.waveSecMin + Math.random() * (this.waveSecMax - this.waveSecMin);
                var volumesCount = durationSec >= 1.0 ? 16 : 8;
                var posDt = 2 * Math.PI / volumesCount;
                var stepSec = durationSec / volumesCount;
                for (var i = 0, pos = posDt; i < volumesCount; i++, pos += posDt) {
                    var value = Math.abs(Math.sin(pos));
                    signal.values.push(new WebTones.StepValue(stepSec, value));
                }
                return true;
            };
            return SinAbsRandom;
        }(WebTones.SignalGenerator));
        SignalGenerators.SinAbsRandom = SinAbsRandom;
    })(SignalGenerators = WebTones.SignalGenerators || (WebTones.SignalGenerators = {}));
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
        function Instrument(channelsCount, playersCount, console) {
            this.playerIndex = 0;
            this.PrePlanSec = 0.2;
            this.PostPlanSec = 0.1;
            this.ChannelsCount = channelsCount;
            this.audioOutput = new WebTones.AudioOutput();
            this.multiPlayers = new Array(playersCount);
            for (var i = 0; i < this.multiPlayers.length; i++) {
                this.multiPlayers[i] = new WebTones.MultiPlayer(channelsCount, this.audioOutput, console);
                this.multiPlayers[i].startAudio();
            }
            this.console = console;
        }
        Instrument.prototype.startAudio = function () {
            for (var _i = 0, _a = this.multiPlayers; _i < _a.length; _i++) {
                var multiPlayer = _a[_i];
                multiPlayer.startAudio();
            }
        };
        Instrument.prototype.getPlayersCount = function () {
            return this.multiPlayers.length;
        };
        Instrument.prototype.getCurrentTimeSec = function () {
            var multiPlayer = this.multiPlayers[0];
            return multiPlayer.getCurrentTimeSec();
        };
        Instrument.prototype.timeToDelayPrePlanSec = function (timeSec) {
            return Math.max(0, timeSec - this.getCurrentTimeSec() - this.PrePlanSec);
        };
        Instrument.prototype.earliestPlanSec = function (timeSec, verbatim) {
            var earliestSec = this.getCurrentTimeSec() + this.PostPlanSec;
            if (timeSec < earliestSec) {
                if (verbatim)
                    console.warn("Moving to earliest possible time: " + timeSec + " -> " + earliestSec + ".");
                return earliestSec;
            }
            else
                return timeSec;
        };
        Instrument.prototype.getMaxTimeSec = function (playerIndex, channelIndex) {
            var multiPlayer = this.multiPlayers[playerIndex];
            return multiPlayer.getMaxTimeSec(channelIndex);
        };
        Instrument.prototype.getMaxTimeAllAllSec = function () {
            var result = 0;
            for (var _i = 0, _a = this.multiPlayers; _i < _a.length; _i++) {
                var multiPlayer = _a[_i];
                result = Math.max(result, multiPlayer.getMaxTimeAllSec());
            }
            return result;
        };
        Instrument.prototype.muteNow = function (durationSec) {
            for (var _i = 0, _a = this.multiPlayers; _i < _a.length; _i++) {
                var multiPlayer = _a[_i];
                multiPlayer.muteNow(durationSec);
            }
        };
        Instrument.prototype.fixPlayerIndex = function (timeSec) {
            // todo use mod anyway and end after re-loop
            for (var i = 0; i < this.multiPlayers.length; i++)
                if (timeSec > this.multiPlayers[i].getMaxTimeAllSec()) {
                    this.playerIndex = i;
                    return;
                }
            var newMultiPlayer = new WebTones.MultiPlayer(this.ChannelsCount, this.audioOutput, this.console);
            newMultiPlayer.startAudio();
            this.multiPlayers.push(newMultiPlayer);
            this.playerIndex = this.multiPlayers.length - 1;
            //this.playerIndex = ( this.playerIndex + 1 ) % this.MultiPlayers.length;
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
            var _this = _super.call(this, 2, 2, console) || this;
            _this.keyDurationSec = 0.3;
            return _this;
        }
        DialPad.prototype.playPhoneNumber = function (phoneNumber) {
            this.muteNow(this.keyDurationSec / 2);
            var timeSec = this.getMaxTimeAllAllSec();
            for (var i = 0; i < phoneNumber.length; i++) {
                var digit = phoneNumber.charAt(i);
                timeSec += this.playNote(timeSec, digit, this.keyDurationSec);
            }
        };
        DialPad.prototype.playNote = function (timeSec, note, durationSec) {
            var freqs = DialPad.frequencies[note];
            if (freqs) {
                var rampSec = durationSec / 2;
                this.playKeyFrequency(0, timeSec, freqs[0], rampSec, rampSec);
                this.playKeyFrequency(1, timeSec, freqs[1], rampSec, rampSec);
            }
            return this.keyDurationSec;
        };
        DialPad.prototype.playKeyFrequency = function (playerIndex, timeSec, frequency, rampUpSec, rampDownSec) {
            var player = this.multiPlayers[playerIndex];
            var timeSec2 = timeSec + rampUpSec;
            var timeSec3 = timeSec2 + rampDownSec;
            player.setFrequencyChangeOneToAll(timeSec, frequency);
            player.setFrequencyChangeOneToAll(timeSec3, frequency);
            player.setVolumeChangeOneToAll(timeSec, 0.0);
            player.setVolumeChangeOneToAll(timeSec2, 1.0);
            player.setVolumeChangeOneToAll(timeSec3, 0.0);
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
            var _this = _super.call(this, Piano.channelsCount, Piano.initialPlayersCount, console) || this;
            _this.useHarmonics = true;
            _this.useStereoBalance = true;
            _this.rampUpSec = 0.03;
            _this.maxHarmonics = 8;
            _this.minVolumeLevel = 0.01;
            return _this;
        }
        Piano.prototype.setUseHarmonics = function (useHarmonics) {
            this.useHarmonics = useHarmonics;
        };
        Piano.prototype.setUseStereoBalance = function (useStereoBalance) {
            this.useStereoBalance = useStereoBalance;
        };
        Piano.prototype.playNote = function (timeSec, note, durationSec) {
            var frequency = Piano.frequencies[note];
            if (frequency && durationSec) {
                var volume = 1 - 0.2 * Math.random();
                var noteForward = Piano.indices[note] / (Piano.notesCount - 1);
                var noteForwardQ = 0.25 + 0.75 * noteForward;
                var noteForwardH = 0.5 + 0.5 * noteForward;
                var noteBackward = 1 - noteForward;
                var noteBackwardQ = 1 - noteForwardQ;
                var noteBackwardH = 1 - noteForwardH;
                var volumes = [this.useStereoBalance ? volume * noteBackward : volume, this.useStereoBalance ? volume * noteForward : volume];
                var rampUpSec = this.rampUpSec;
                var rampDownSec = Math.max(rampUpSec, durationSec - rampUpSec);
                var rampDownTailSec = rampDownSec + rampDownSec * noteBackwardQ;
                this.playKey(timeSec, volumes, frequency, rampUpSec, rampDownTailSec);
                if (this.useHarmonics) {
                    var harmonics = Math.round(this.maxHarmonics * noteBackwardH);
                    for (var h = 0; h < harmonics; h++) {
                        var hMul = h + 2;
                        var hForward = h / harmonics;
                        var hBackward = 1 - hForward;
                        var hVolumes = [volumes[0] / hMul / hMul * noteBackwardQ, volumes[1] / hMul / hMul * noteBackwardQ];
                        var hSharpnessMul = 1 + 0.01 * noteBackwardH;
                        var hFrequency = frequency * hMul * hSharpnessMul;
                        var hHoldMul = 1 + 0.2 + 0.2 * noteBackwardH; // * hBackward;
                        var hRampUpSec = rampUpSec;
                        var hRampDownTailSec = rampDownTailSec * hHoldMul;
                        if (hVolumes[0] >= this.minVolumeLevel || hVolumes[1] >= this.minVolumeLevel)
                            this.playKey(timeSec, hVolumes, hFrequency, hRampUpSec, hRampDownTailSec);
                    }
                }
                return rampUpSec + rampDownSec;
            }
            else
                return 0;
        };
        Piano.prototype.playKey = function (timeSec, volumes, frequency, rampUpSec, rampDownSec) {
            this.fixPlayerIndex(timeSec);
            var player = this.multiPlayers[this.playerIndex];
            var timeSec2 = timeSec + rampUpSec * 0.5;
            var timeSec3 = timeSec + rampUpSec * 1.0;
            player.setFrequencyChangeOneToAll(timeSec, frequency);
            player.setFrequencyChangeOneToAll(timeSec3 + rampDownSec, frequency);
            player.setVolumeChangeAllToAll(timeSec, volumes, 0.0);
            player.setVolumeChangeAllToAll(timeSec2, volumes, 0.7);
            player.setVolumeChangeAllToAll(timeSec3, volumes, 1.0);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.125, volumes, 0.35);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.250, volumes, 0.75);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.375, volumes, 0.25);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.500, volumes, 0.50);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.675, volumes, 0.12);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.750, volumes, 0.25);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 0.875, volumes, 0.05);
            player.setVolumeChangeAllToAll(timeSec3 + rampDownSec * 1.000, volumes, 0.00);
        };
        Piano.getNotesIndices = function (frequencies) {
            var notes = {};
            var index = 0;
            for (var noteFreq in frequencies)
                notes[noteFreq] = index++;
            return notes;
        };
        Piano.channelsCount = 2;
        Piano.initialPlayersCount = 16;
        Piano.notesCount = 88;
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
        Piano.indices = Piano.getNotesIndices(Piano.frequencies);
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
            var _this = _super.call(this, Theremin.ChannelsCount, Theremin.PlayersCount, console) || this;
            _this.freqGenerators = [];
            _this.volumeGenerators = [];
            _this.freqStarted = [];
            _this.volumeStarted = [];
            _this.minFrequencyHz = 50;
            _this.maxFrequencyHz = 4000;
            _this.IdleWaitMs = 200;
            _this.player = _this.multiPlayers[0];
            return _this;
        }
        Theremin.prototype.playNote = function (timeSec, note, durationSec) {
            var channel = parseInt(note[0]);
            var mode = parseInt(note[1]);
            //this.playSound( timeSec, channel, mode, durationSec );
            return durationSec;
        };
        Theremin.prototype.playSound = function (channel, volume, pitch01, waveSec) {
            console.info("Play C:" + channel + " V:" + volume + " P:" + pitch01 + " W:" + waveSec);
            var startSec = this.getCurrentTimeSec();
            var frequency = this.minFrequencyHz + Math.pow(pitch01, 3) * (this.maxFrequencyHz - this.minFrequencyHz);
            this.freqGenerators[channel] = new WebTones.SignalGenerators.Const(frequency);
            this.volumeGenerators[channel] = new WebTones.SignalGenerators.SinAbs(volume, waveSec);
            //this.volumeGenerators[ channel ] = new SignalGenerators.SinAbsRandom( volume, waveSec / 4, waveSec );
            this.morphSoundStart(channel);
        };
        Theremin.prototype.morphSoundStart = function (channel) {
            if (!this.freqStarted[channel]) {
                this.freqStarted[channel] = true;
                this.morphSound(this.freqGenerators, channel, this.player.setFrequencyChangeOneToOne.bind(this.player));
            }
            if (!this.volumeStarted[channel]) {
                this.volumeStarted[channel] = true;
                this.morphSound(this.volumeGenerators, channel, this.player.setVolumeChangeOneToOne.bind(this.player));
            }
        };
        Theremin.prototype.morphSound = function (generators, channel, morpher) {
            var _this = this;
            var generator = generators[channel];
            if (generator != null && generator.shouldContinue()) {
                var minDurationSec = 2;
                var signal = generator.generate(minDurationSec);
                if (signal != null) {
                    var currentSec = this.player.getCurrentTimeSec();
                    var earliestSec = this.earliestPlanSec(currentSec, false);
                    var maxSec = this.player.getMaxTimeSec(channel);
                    var timeSec = Math.max(earliestSec, maxSec);
                    var nextSec = this.morphSoundWithSignal(channel, timeSec, signal, morpher);
                    var nextDelaySec = this.timeToDelayPrePlanSec(nextSec);
                    var nextDelayMs = nextDelaySec >= 0 ? nextDelaySec * 1000 : this.IdleWaitMs;
                    setTimeout(function () { return _this.morphSound(generators, channel, morpher); }, nextDelayMs);
                }
                else
                    setTimeout(function () { return _this.morphSound(generators, channel, morpher); }, this.IdleWaitMs);
            }
            else
                setTimeout(function () { return _this.morphSound(generators, channel, morpher); }, this.IdleWaitMs);
        };
        Theremin.prototype.morphSoundWithSignal = function (channel, timeSec, signal, morpher) {
            for (var _i = 0, _a = signal.values; _i < _a.length; _i++) {
                var point = _a[_i];
                timeSec += point.stepSec;
                morpher(channel, timeSec, point.value);
            }
            return timeSec;
        };
        Theremin.ChannelsCount = 2;
        Theremin.PlayersCount = 1;
        return Theremin;
    }(WebTones.Instrument));
    WebTones.Theremin = Theremin;
})(WebTones || (WebTones = {}));
var WebTones;
(function (WebTones) {
    var StaffString = /** @class */ (function () {
        function StaffString() {
            this.TimingRe = /^\d\/\d$/;
            this.BarRe = /^[|$]$/;
            this.SymbolRe = /^[#@]?[a-g]\d\/\d{1,2}$/;
        }
        StaffString.prototype.setSelection = function (selectionBegin, selectionEnd) {
            this.selectionBegin = selectionBegin;
            this.selectionEnd = selectionEnd;
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
                        var subNote = subNotes[s];
                        if (subNote.length > 0) {
                            var symbol = this.createSymbol(subNote);
                            symbol.first = c == 0 && n == 0 && s == 0;
                            symbol.last = c == chords.length - 1 && n == notes.length - 1 && s == subNotes.length - 1;
                            symbol.chordFirst = n == 0 && s == 0;
                            symbol.chordLast = n == notes.length - 1 && s == subNotes.length - 1;
                            symbol.seqFirst = s == 0;
                            symbol.seqLast = s == subNotes.length - 1;
                            symbol.posBegin = totalChars;
                            symbol.posEnd = totalChars = totalChars + subNote.length;
                            this.symbols.push(symbol);
                        }
                    }
                }
            }
            this.processSymbols();
        };
        StaffString.prototype.createSymbol = function (symbolStr) {
            var symbol = new StaffSymbol();
            if (symbolStr.match(this.TimingRe)) {
                var parts = symbolStr.split('/');
                symbol.type = SymbolType.Timing;
                symbol.name = parts[0];
                symbol.div = parseInt(parts[1]);
            }
            else if (symbolStr.match(this.BarRe)) {
                symbol.type = SymbolType.Bar;
                symbol.name = symbolStr;
            }
            else if (symbolStr.match(this.SymbolRe)) {
                var parts = symbolStr.split('/');
                symbol.type = SymbolType.Note;
                symbol.name = parts[0];
                symbol.div = parts.length == 2 ? new Number(parts[1]).valueOf() : 1;
            }
            return symbol;
        };
        return StaffString;
    }());
    WebTones.StaffString = StaffString;
    var SymbolType;
    (function (SymbolType) {
        SymbolType[SymbolType["Timing"] = 0] = "Timing";
        SymbolType[SymbolType["Bar"] = 1] = "Bar";
        SymbolType[SymbolType["Note"] = 2] = "Note";
    })(SymbolType = WebTones.SymbolType || (WebTones.SymbolType = {}));
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
            _this.ErrorColor = 'red';
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
                if (symbol.name == '$')
                    this.gotoNextStaff();
            }
        };
        StaffStringPainter.prototype.processNote = function (index) {
            if (this.notesDrawn == 0)
                this.drawStaff();
            var symbol = this.symbols[index];
            if (symbol.type == WebTones.SymbolType.Timing) {
                return index;
            }
            else if (symbol.type == WebTones.SymbolType.Bar) {
                this.drawBar();
                return index;
            }
            else if (symbol.type == WebTones.SymbolType.Note) {
                if (symbol.seqFirst && !symbol.seqLast) {
                    var index2 = this.findSeqLast(index);
                    if (index2 > -1) {
                        this.drawMultiNotes(index, index2);
                        return index2;
                    }
                    else {
                        this.drawSingleNote(index);
                        return index;
                    }
                }
                else {
                    this.drawSingleNote(index);
                    return index;
                }
            }
            else {
                this.drawError();
                return index;
            }
        };
        StaffStringPainter.prototype.drawStaff = function () {
            this.drawNoteMark('$', this.getCurrentX(), this.getLineY(this.staffIndex, 1));
            this.drawNoteMark('$', this.getCurrentX(), this.getLineY(this.staffIndex, 5));
            if (this.staffIndex == 0) {
                this.drawNoteMark('3', this.getCurrentX(), this.getLineY(this.staffIndex, 1));
                this.drawNoteMark('8', this.getCurrentX(), this.getLineY(this.staffIndex, 5));
            }
            var width = this.canvas.width;
            for (var line = 0; line < 5; line++) {
                var y1 = this.getLineY(this.staffIndex, line);
                this.drawLine(this.LineColor, 0, y1, width, y1);
                var y2 = this.getLineY(this.staffIndex, line - 6);
                this.drawLine(this.LineColor, 0, y2, width, y2);
            }
        };
        StaffStringPainter.prototype.drawError = function () {
            var x = this.getCurrentX();
            var y1 = this.getNoteY(3);
            var y2 = this.getNoteY(-5);
            this.context.beginPath();
            this.drawLine(this.ErrorColor, x, y1, x, y2);
            this.context.stroke();
            this.notesDrawn += 0.5;
        };
        StaffStringPainter.prototype.drawBar = function () {
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
            var noteX1;
            var noteX2;
            for (var i = index1; i <= index2; i++) {
                this.drawNote(i, flagDir, false);
                if (i == index1)
                    noteX1 = this.getCurrentX();
                if (i == index2)
                    noteX2 = this.getCurrentX();
                this.notesDrawn += 1.0;
            }
            this.drawMultiDashes(index1, index2, noteX1, noteX2, flagDir);
        };
        StaffStringPainter.prototype.drawSingleNote = function (index) {
            var symbol = this.symbols[index];
            var line = this.getNoteLine(symbol.name);
            if (line != null) {
                var flagDir = this.getFlagDir(line);
                this.drawNote(index, flagDir, true);
                this.notesDrawn += 1.0;
            }
        };
        StaffStringPainter.prototype.drawNote = function (index, flagDir, drawDashes) {
            var symbol = this.symbols[index];
            var line = this.getNoteLine(symbol.name);
            if (line != null) {
                var noteX = this.getCurrentX();
                var noteY = this.getNoteY(line);
                if (symbol.name.indexOf('#') > -1)
                    this.drawNoteMark('♯', noteX, noteY);
                else if (symbol.name.indexOf('@') > -1)
                    this.drawNoteMark('♭', noteX, noteY);
                var startNotesDrawn = this.notesDrawn;
                noteX = this.getCurrentX();
                if (symbol.posBegin >= this.selectionBegin && symbol.posEnd <= this.selectionEnd ||
                    symbol.posBegin <= this.selectionBegin && symbol.posEnd >= this.selectionEnd)
                    this.drawNoteSelection(noteX, noteY);
                this.drawMiniLines(line, noteX);
                this.drawElipse(noteX, noteY, symbol.div > 2);
                this.drawFlagPost(line, symbol.div, flagDir, noteX, noteY);
                if (drawDashes)
                    this.drawDashes(line, symbol.div, noteX, flagDir);
                this.notesDrawn = startNotesDrawn;
                this.updateWidth(noteX);
                this.updateHeight(noteY);
            }
            else
                this.drawError();
        };
        StaffStringPainter.prototype.drawMiniLine = function (line, x) {
            var y = this.getNoteY(line);
            this.context.beginPath();
            this.context.moveTo(x - this.noteWidth, y);
            this.context.lineTo(x + this.noteWidth, y);
            this.context.strokeStyle = this.NoteColor;
            this.context.stroke();
        };
        StaffStringPainter.prototype.drawNoteMark = function (mark, noteX, noteY) {
            this.context.font = this.noteFont;
            this.context.fillStyle = this.NoteColor;
            this.context.fillText(mark, noteX, noteY + this.noteWidth2);
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
            var dashes = this.getNoteDashes(symbol1.div);
            var line1 = this.getNoteLine(symbol1.name);
            var line2 = this.getNoteLine(symbol2.name);
            if (line1 != null && line2 != null) {
                var fx1 = this.getFlagX(noteX1, flagDir);
                var fy1 = this.getFlagY(line1, flagDir);
                var fx2 = this.getFlagX(noteX2, flagDir);
                var fy2 = this.getFlagY(line2, flagDir);
                this.context.strokeStyle = this.NoteColor;
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
                if (this.symbols[i].type == null || this.symbols[index].div != this.symbols[i].div)
                    return index != i - 1 ? i - 1 : -1;
                else if (this.symbols[i].seqLast)
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
                var line = this.getNoteLine(symbolX.name);
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
            _this.bpm = 72;
            _this.timingDiv = 4;
            _this.liveSchedule = true;
            _this.timeSec = 0;
            _this.cordStartTimeSec = 0;
            _this.cordEndTimeSec = 0;
            _this.instrument = instrument;
            return _this;
        }
        StaffStringPlayer.prototype.setBpm = function (bpm) {
            this.bpm = bpm;
        };
        StaffStringPlayer.prototype.setLiveSchedule = function (liveSchedule) {
            this.liveSchedule = liveSchedule;
        };
        StaffStringPlayer.prototype.setSymbolReceiver = function (symbolReceiver) {
            this.symbolReceiver = symbolReceiver;
        };
        StaffStringPlayer.prototype.processSymbols = function () {
            this.processSymbolsFrom(0);
        };
        StaffStringPlayer.prototype.processSymbolsFrom = function (beginIndex) {
            var _this = this;
            this.timeSec = this.instrument.earliestPlanSec(this.timeSec, true);
            var _loop_1 = function (index) {
                var symbol = this_1.symbols[index];
                if (symbol.chordFirst) {
                    this_1.cordStartTimeSec = this_1.timeSec;
                    this_1.cordEndTimeSec = this_1.timeSec;
                }
                if (symbol.seqFirst)
                    this_1.timeSec = this_1.cordStartTimeSec;
                if (this_1.symbolReceiver)
                    this_1.symbolReceiver(symbol);
                this_1.processNote(symbol);
                if (symbol.seqLast)
                    this_1.cordEndTimeSec = Math.max(this_1.cordEndTimeSec, this_1.timeSec);
                if (symbol.chordLast && this_1.liveSchedule) {
                    var nextAction = function () { return _this.processSymbolsFrom(index + 1); };
                    var nextDelaySec = this_1.instrument.timeToDelayPrePlanSec(this_1.timeSec);
                    var nextDelayMs = Math.max(0, nextDelaySec * 1000);
                    setTimeout(nextAction, nextDelayMs);
                    return "break";
                }
            };
            var this_1 = this;
            for (var index = beginIndex; index < this.symbols.length; index++) {
                var state_1 = _loop_1(index);
                if (state_1 === "break")
                    break;
            }
        };
        StaffStringPlayer.prototype.processNote = function (symbol) {
            if (symbol.type == WebTones.SymbolType.Timing) {
                console.log("Timing: " + symbol.name + "/" + symbol.div);
                this.timingDiv = symbol.div;
            }
            else if (symbol.type == WebTones.SymbolType.Note) {
                var durationSec = 60 / this.bpm * this.timingDiv / symbol.div;
                this.timeSec += this.instrument.playNote(this.timeSec, symbol.name, durationSec);
            }
        };
        return StaffStringPlayer;
    }(WebTones.StaffString));
    WebTones.StaffStringPlayer = StaffStringPlayer;
})(WebTones || (WebTones = {}));
