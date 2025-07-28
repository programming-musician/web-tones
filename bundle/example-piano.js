var simpleConsole;
var piano;
var playMusic = function (inputId) {
    var _this = this;
    if (!simpleConsole)
        simpleConsole = new WebTones.JavascriptConsole();
    if (!piano)
        piano = new WebTones.Piano(simpleConsole);
    var input = document.getElementById(inputId);
    if (input) {
        var bpm = parseInt(document.getElementById("bpm").value);
        var useHarmonics = document.getElementById("harmonics").checked;
        var useStereoBalance = document.getElementById("stereoBalance").checked;
        var useLiveSchedule = document.getElementById("liveSchedule").checked;
        var selectPlayedSymbol = function (symbol) {
            if (symbol.chordFirst)
                input.selectionStart = symbol.posBegin;
            if (symbol.chordLast)
                input.selectionEnd = symbol.posEnd;
            if (symbol.last)
                _this.console.log("Used players: " + piano.getPlayersCount());
        };
        var staffPlayer = new WebTones.StaffStringPlayer(piano);
        piano.setUseHarmonics(useHarmonics);
        piano.setUseStereoBalance(useStereoBalance);
        staffPlayer.setBpm(bpm);
        staffPlayer.setLiveSchedule(useLiveSchedule);
        staffPlayer.setSymbolReceiver(selectPlayedSymbol);
        staffPlayer.process(input.value);
    }
};
var drawMusic = function (inputId, outputId) {
    var input = document.getElementById(inputId);
    var output = document.getElementById(outputId);
    var staffPainter = new WebTones.StaffStringPainter(output);
    staffPainter.setSelection(input.selectionStart, input.selectionEnd);
    staffPainter.process(input.value);
    output.width = staffPainter.getWidth();
    output.height = staffPainter.getHeight();
    staffPainter.process(input.value);
};
var notesFuElise = "3/8 e5/16,#d5/16 |\ne5/16,#d5/16,e5/16,b4/16,#d5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 |\nb4/8:e2/16,e3/16,#g3/16 e4/16,#g4/16,b4/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,e5/16,#d5/16 |\ne5/16,#d5/16,e5/16,b4/16,#d5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 $\n\nb4/8:e2/16,e3/16,#g3/16 d4/16,c5/16,b4/16 |\na4/4:a2/16,e3/16,a3/16 | |\na4/8:a2/16,e3/16,a3/16 b4/16,c5/16,d5/16 |\ne5/8:c3/16,g3/16,c4/16 g4/16,f5/16,e5/16 |\nd5/8:g2/16,g3/16,b3/16 f4/16,e5/16,d5/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,d5/16,c5/16 |\nb4/8:e2/16,e3/16,e4/16 e4/16,e5/16 g2/16 $\n\ng3/16 e5/16,e6/16 f3/16,g3/16 #d5/16 |\ne5/16 #f3/16,g3/16 #d5/16,e5/16,d5/16 |\ne5/16,#d5/16,e5/16,b4/16,#d5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 |\nb4/8:e2/16,e3/16,#g3/16 e4/16,#g4/16,b4/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,e5/16,#d5/16 $\n\ne5/16,#d5/16,e5/16,b4/16,#d5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 |\nb4/8:e2/16,e3/16,#g3/16 d4/16,c5/16,b4/16 |\na4/8:a2/16,e3/16,a3/16 b4/16,c5/16,d5/16 | |\na4/8:a2/16,e3/16,a3/16 c5/16,c5/16,c5/16:e4/16,f4/16,g4/16:b3/16,c4/16,c4/16 |\nf4/16,a4/16 c5/4,c5/16,c4/8:f3/16,a3/16,c4/16,a3/16,c4/16,a3/16 $\n\ne5/8,d5/8,@b5/16,a5/32:f3/16,b3/16,d4/16,b3/16,d4/16,b3/16 |\na5/16,g5/16,f5/16,e5/16,d5/16,c5/16:f3/16,e4/16,@b3/16,c4/16,b3/16,c4/16 |\n@b4/8,a4/8,b4/8,a4/32,g4/32,a4/32,b4/32:f3/16,a3/16,c4/16,a3/16,c4/16,a3/16 |\nc5/4 d5/8,d5/8 |\ne5/8 e5/16,f5/8,a4/8 |\nc5/4 d5/16,b4/32 $";
