var simpleConsole2;
var phoneDialPad;
var examplePlayNumber = function (id) {
    if (!simpleConsole2)
        simpleConsole2 = new JavascriptConsole();
    if (!phoneDialPad)
        phoneDialPad = new PhoneDialPad(simpleConsole2);
    var input = document.getElementById(id);
    if (input)
        phoneDialPad.playPhoneNumber(input.value);
};
