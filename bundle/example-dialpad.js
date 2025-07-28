var simpleConsole = new WebTones.JavascriptConsole();
var phoneDialPad;
var examplePlayInput = function (id) {
    var input = document.getElementById(id);
    if (input)
        examplePlayNumber(input.value);
};
var examplePlayNumber = function (number) {
    if (!phoneDialPad)
        phoneDialPad = new WebTones.DialPad(simpleConsole);
    phoneDialPad.playPhoneNumber(number);
};
