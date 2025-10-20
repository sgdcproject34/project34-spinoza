function EnableButton(btnId, counter, btnEnabledClass, btnDisabledClass) {
    var button = document.getElementById(btnId);
    counter--;
    if (counter <= 0) {
        if (button) {
            button.disabled = false;
            $(button).removeClass(btnDisabledClass);
            $(button).addClass(btnEnabledClass);
        }
    }
    else {
        setTimeout("EnableButton('" + btnId + "', " + counter + ", '" + btnEnabledClass + "', '" + btnDisabledClass + "')", 1000);
    }
}

function ShowValidationError(fieldID, errorMessage) {
    if (fieldID == undefined || errorMessage == undefined || errorMessage == "")
        return;

    var targetID = fieldID.replace('DataModel.', 'DataModel_');
    var fieldEl = $('#' + targetID);

    if (fieldEl.length <= 0)
        return;
    
    if (errorMessage.charAt(0) === '"' && errorMessage.charAt(errorMessage.length - 1) === '"') {
        errorMessage = errorMessage.substr(1, errorMessage.length - 2);
    }

    fieldEl.attr('data-content', errorMessage);
    
    if(fieldEl.attr('data-placement') == undefined || fieldEl.attr('data-placement') == '')
        fieldEl.attr('data-placement', 'auto');

    fieldEl.attr('data-container', 'body');
    fieldEl.attr('data-viewport', 'body');
    fieldEl.popover('show');
}

function RemoveValidationError(fieldID) {
    if (fieldID == undefined)
        return;
    
    var targetID = fieldID.replace('DataModel.', 'DataModel_');
    var fieldEl = $('#' + targetID);

    if (fieldEl.length <= 0)
        return;

    if( fieldEl.attr('data-toggle') == 'popover')     
        fieldEl.popover('destroy');
}

function ShowAsWizard(Url, Title)
{
    var container = document.getElementById("overlay-container");
    //<iframe sandbox='allow-scripts allow-popups allow-forms'>
    html = "<div class='wizard-style'>                                                                  \
                <div class='wizard-title'>" + Title + "</div>                                           \
                <div class='btn-exit close' data-dismiss='alert' tooltip='close' aria-label='Close' onclick='EnableLanguageSelection(true);'>&times;</div>    \
                <iframe src='" + Url + "' class='iframe' scrolling='no' ></iframe>      \
            </div>"
    if(container)
    {
        container.innerHTML = html;
    }

    $("#overlay-container").draggable({
        handle: ".wizard-title"
    });

    EnableLanguageSelection(false);
}

function DoPost(btnIn, activeClass, disabledClass, checkLinkDisabled, ErrorFieldID) {
    var data = $('#AacDataForm').serializeArray();
    var btn = $(btnIn)
    data.push({ name: 'trigger', value: btn.attr('id') });
    data.push({ name: 'sentonfocus', value: (checkLinkDisabled ? "0" : "1") });
    
    if (checkLinkDisabled && btn.hasClass("link-btn-disabled"))
        return;

    var success = false;
    btn.removeClass(activeClass);
    btn.addClass(disabledClass);
    btn.tooltip('hide');
    
    $.ajax({
        url: btn.data('url'),
        type: 'POST',
        data: data,
        success: function (result) {
            if(result.Success)
            {
                btn.attr('data-on-focus-sent', 1);
                if (result.SendBtnDisabled)
                    btn.attr('disabled', true);
                if (result.TestTemporarilyDisabledTimer) {
                    setTimeout('EnableButton("' + btn.attr('id') + '", ' + result.TestTimeOut + ', "' + activeClass + '", "' + disabledClass + '")', 1000);
                }
            }
            else {
                if (result.ErrorMessage != undefined && result.ErrorMessage != "")
                {
                    ShowValidationError(ErrorFieldID, result.ErrorMessage);
                }
                if (result.SendBtnDisabled)
                    btn.attr('disabled', true);
                if (result.TestTemporarilyDisabledTimer) {
                    setTimeout('EnableButton("' + btn.attr('id') + '", ' + result.TestTimeOut + ', "' + activeClass + '", "' + disabledClass + '")', 1000);
                }
            }
        }
    });
}

function CheckClasses(inputId, pinId, requirePin, nextBtn) {
    if ($(inputId).hasClass('valid-input-icon')) {
        if (requirePin) {
            if ($(pinId).hasClass('valid-input-icon')) {
                return EnableDisableButton(nextBtn, true);
            }
        }
        else {
            return EnableDisableButton(nextBtn, true);
        }
    }
    return false;
}

function EnableDisableButton(NextBtn, Enable) {
    if (NextBtn) {
        NextBtn.disabled = !Enable;
        if (Enable) {
            NextBtn.className = 'btn-submit';
        }
        else {
            NextBtn.className = 'btn-submit-disabled';
        }
    }
    return true;

}

function ValidatePasswords(errorMsg) {
    PasswordField = $("input#DataModel_Password");
    ConfirmPasswordField = $("input#DataModel_ConfirmPassword");

    if (PasswordField.length <= 0 || ConfirmPasswordField.length <= 0)
        return true;

    if ((PasswordField[0].value != ConfirmPasswordField[0].value)) {
        ShowValidationError('DataModel_ConfirmPassword', errorMsg)
        return false;
    }
    return true;
}

function SubmitOnEnter(e){
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
        $('#HiddenNextBtn').click();
        return false;
    } else {
        return true;
    }
}

function OnChangeUserName() {
    
    var UserName = document.getElementById("DataModel_UserName").value
    var Domain = document.getElementById("DataModel_Domain")

    var type = Domain.getAttribute("type")
    if (type != "hidden") {
        if (UserName.search("@|\\\\") != -1)
            Domain.disabled = true
        else
            Domain.disabled = false
    }
    return true;
}

function EnableLanguageSelection(enable)
{
    var languageSelection = $("#dropdown-language");
    
    if (languageSelection.length > 0) {
        if (enable)
            languageSelection.removeClass("hidden-field");
        else
            languageSelection.addClass("hidden-field");
    }
}

var closeIFrame = function ()
{
    var myNode = document.getElementById("overlay-container");
    if (!myNode) return;
    while (myNode.firstChild)
        myNode.removeChild(myNode.firstChild);
    EnableLanguageSelection(true);
}

var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        if(callback != undefined)
            timers[uniqueId] = setTimeout(callback, ms);
    };
})();

function IsMobile(ScreenWidth)
{
    if ($(window).width() < 520)
        return true;
    return false;
}