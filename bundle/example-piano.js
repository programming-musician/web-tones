var simpleConsole;
var piano;
var examplePlayMusic = function (id) {
    if (!simpleConsole)
        simpleConsole = new WebTones.JavascriptConsole();
    if (!piano)
        piano = new WebTones.Piano(simpleConsole);
    var input = document.getElementById(id);
    if (input) {
        var staffPlayer = new WebTones.StaffStringPlayer(piano);
        staffPlayer.setCarret(input.selectionStart);
        staffPlayer.process(input.value);
    }
};
var exampleDrawMusic = function (inputId, outputId) {
    var input = document.getElementById(inputId);
    var output = document.getElementById(outputId);
    var staffPainter = new WebTones.StaffStringPainter(output);
    staffPainter.setCarret(input.selectionStart);
    staffPainter.process(input.value);
    output.width = staffPainter.getWidth();
    staffPainter.process(input.value);
    console.log("W=" + staffPainter.getWidth());
    console.log("H=" + staffPainter.getHeight());
};
var notesFuElise = "e5/16,d#5/16 |\ne5/16,d#5/16,e5/16,b4/16,d#5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,h4/16 |\nb4/8:e2/16,e3/16,g#3/16 e4/16,g#4/16,b4/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,e5/16,d#5/16 |\ne5/16,d#5/16,e5/16,b4/16,d#5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 ||\n\nb4/8:e2/16,e3/16,g#3/16 d4/16,c5/16,b4/16 |\na4/4:a2/16,e3/16,a3/16 | |\na4/8:a2/16,e3/16,a3/16 b4/16,c5/16,d5/16 |\ne5/8:c3/16,g3/16,c4/16 g4/16,f5/16,e5/16 |\nd5/8:g2/16,g3/16,b3/16 f4/16,e5/16,d5/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,d5/16,c5/16 |\nb4/8:e2/16,e3/16,e4/16 e4/16,e5/16 g2/16 ||\n\ng3/16 e5/16,e6/16 f3/16,g3/16 d#5/16 |\ne5/16 f#3/16,g3/16 d#5/16,e5/16,d5/16 |\ne5/16,d#5/16,e5/16,b4/16,d#5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 |\nb4/8:e2/16,e3/16,g#3/16 e4/16,g#4/16,b4/16 |\nc5/8:a2/16,e3/16,a3/16 e4/16,e5/16,d#5/16 ||\n\ne5/16,d#5/16,e5/16,b4/16,d5/16,c5/16 |\na4/8:a2/16,e3/16,a3/16 c4/16,e4/16,a4/16 |\nb4/8:e2/16,e3/16,g3/16 d4/16,c5/16,b4/16 |\na4/8:a2/16,e3/16,a3/16 b4/16,c5/16,d5/16 | |\n\na4/8:a2/16,e3/16,a3/16 c5/16,c5/16,c5/16:e4/16,f4/16,g4/16 e4/16 b3/16,c4/16,c4/16 |\nf4/16,a4/16 c5/4:f3/16,a3/16,c4/16,a3/16,c4/16,a3/16 ||\n\ne5/8,d5/8:f3/16,b3/16,d4/16,b3/16,d4/16,b3/16 |\na5/16,g5/16,f5/16,e5/16,d5/16,c5/16:f3/16,e4/16,b3/16,c4/16,b3/16,c4/16 |\nb4/8,a4/8,b4/8,a4/32,g4/32,a4/32,b4/32:f3/16,a3/16,c4/16,a3/16,c4/16,a3/16 |\nc5/4 d5/8,d5/8 |\ne5/8 e5/16,f5/8,a4/8 |\nc5/4 d5/16,b4/32 ||";
