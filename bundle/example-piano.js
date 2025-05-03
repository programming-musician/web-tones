var simpleConsole;
var piano;
var examplePlayMusic = function (id) {
    if (!simpleConsole)
        simpleConsole = new JavascriptConsole();
    if (!piano)
        piano = new GrandPiano(simpleConsole);
    var input = document.getElementById(id);
    if (input) {
        var timeSec = piano.getCurrentTimeSec();
        var staffPlayer = new StaffStringPlayer(piano, timeSec);
        staffPlayer.setCarret(input.selectionStart);
        staffPlayer.processMusicString(input.value);
    }
};
var exampleDrawMusic = function (inputId, outputId) {
    var input = document.getElementById(inputId);
    var output = document.getElementById(outputId);
    var staffPainter = new StaffStringPainter(output);
    staffPainter.setCarret(input.selectionStart);
    staffPainter.processMusicString(input.value);
};
