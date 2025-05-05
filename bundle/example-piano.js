var simpleConsole;
var piano;
var examplePlayMusic = function (id) {
    if (!simpleConsole)
        simpleConsole = new WebTones.JavascriptConsole();
    if (!piano)
        piano = new WebTones.GrandPiano(simpleConsole);
    var input = document.getElementById(id);
    if (input) {
        var staffPlayer = new WebTones.StaffStringPlayer(piano);
        staffPlayer.setCarret(input.selectionStart);
        staffPlayer.processMusicString(input.value);
    }
};
var exampleDrawMusic = function (inputId, outputId) {
    var input = document.getElementById(inputId);
    var output = document.getElementById(outputId);
    var staffPainter = new WebTones.StaffStringPainter(output);
    staffPainter.setCarret(input.selectionStart);
    staffPainter.processMusicString(input.value);
};
