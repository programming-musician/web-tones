var simpleConsole2 = new WebTones.JavascriptConsole();
var phoneDialPad;
var examplePlayInput = function (id) {
    var input = document.getElementById(id);
    if (input)
        examplePlayNumber(input.value);
};
var examplePlayNumber = function (number) {
    if (!phoneDialPad)
        phoneDialPad = new WebTones.DialPad(simpleConsole2);
    phoneDialPad.playPhoneNumber(number);
};
var examplePlayTone = function () {
    if (!phoneDialPad)
        phoneDialPad = new WebTones.DialPad(simpleConsole2);
    phoneDialPad.playTone(null, phoneDialPad.getCurrentTimeSec(), 700, 5000, 5000);
    setTimeout(function () {
        phoneDialPad.muteNow(1);
    }, 4000);
};
