var simpleConsole;
var theremin;
var playMusic = function (inputId) {
    var _this = this;
    if (!simpleConsole)
        simpleConsole = new WebTones.JavascriptConsole();
    if (!theremin)
        theremin = new WebTones.Theremin(simpleConsole);
    var input = document.getElementById(inputId);
    if (input) {
        var selectPlayedSymbol = function (symbol) {
            if (symbol.chordFirst)
                input.selectionStart = symbol.posBegin;
            if (symbol.chordLast)
                input.selectionEnd = symbol.posEnd;
            if (symbol.last)
                _this.console.log("Used players: " + theremin.getPlayersCount());
        };
    }
};
var pauseMusic = function (inputId) {
};
var thereminControl = function (e, channel) {
    if (e.buttons == 1 && e.target instanceof HTMLElement) {
        var board = e.target;
        var wave = document.getElementById("wave" + channel);
        if (board != null && wave != null) {
            var rect = board.getBoundingClientRect();
            var volume = Math.abs(e.clientY - rect.bottom) / rect.height;
            var pitch01 = Math.abs(e.clientX - rect.left) / rect.width;
            var waveSec = parseFloat(wave.value);
            theremin.playSound(channel, volume, pitch01, waveSec);
        }
    }
};
