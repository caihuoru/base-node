$(document).ready(
    function () {
        window.onresize = function () {
            var contentHeight = $("#webgl-content").innerHeight();
            var availableSpace = contentHeight;

            $("#gameContainer").attr("height", availableSpace).css("max-height", availableSpace).css("min-height", availableSpace);

            var w = $(window).innerWidth();
            var h = $(window).innerHeight();

            var scaleFactor = 16 / 9;
            if (w / h > scaleFactor) {
                w = h / 9 * 16;
            } else {
                h = w / 16 * 9;
            }

            $("canvas").attr("width", w).attr("height", h).css("max-width", w).css("max-height", h).css("min-width", w).css("min-height", h);
            window.focus();
        };

        window.onresize();
        window.onclick = function () {
            window.focus();
        };

        document.onkeydown = function (event) {
            if (!event) { /* This will happen in IE */
                event = window.event;
            }

            var keyCode = event.keyCode;

            if (keyCode == 8 && event.target.id != "canvas") {
                if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
                    //event.stopPropagation();
                } else {
                    console.log("prevented");
                    event.returnValue = false;
                }
                return false;
            }
        };
    }
);

$(window).on('unload beforeunload', function () {
    try {
        sessionStorage.closedLastTab = '1';
    } catch (e) {
    }
});

function generateRandomId() {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var deviceId = '';

    for (var i = 0; i < 32; i++) {
        deviceId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return deviceId;
}

function getDeviceId() {
    var deviceId;

    try {
        if (sessionStorage.deviceId && sessionStorage.closedLastTab !== '2') {
            deviceId = sessionStorage.deviceId;
        } else {
            sessionStorage.deviceId = deviceId = generateRandomId();
        }

        sessionStorage.closedLastTab = '2';
    } catch (e) {
        deviceId = generateRandomId();
    }

    return deviceId;
}

function requestWebPlatform() {
    var cdnLocation = window.location.hostname;
    window.onresize();
    // gameInstance.SendMessage("GameRunner", "SetSessionID", getDeviceId());
    // gameInstance.SendMessage("GameRunner", "SetWebPlatform", "facebook");
    // if (cdnLocation == "cdn-files-accept.gop3.nl") {
        // console.log('setting platform based on location: ' + cdnLocation);
        // gameInstance.SendMessage("GameRunner", "SetServerType", "accept");
        // gameInstance.SendMessage("GameRunner", "SetDeveloperName", "Apollo");
    // } else {
        // gameInstance.SendMessage("GameRunner", "SetServerType", "live");
    // }
    gameInstance.logo.style.display = gameInstance.progress.style.display  = "none";
	gameInstance.intro.style.display = "none";
	gameInstance.logo.style.display = "none";
}

function openAndroidURL()
{
	window.open("https://itunes.apple.com/us/app/apple-store/id1185793864?mt=8");
}

function openiOSURL()
{
	window.open("http://store.steampowered.com/app/680310/");
}

function openSteamURL()
{
	window.open("http://pokerworld.game/");
}


function openWebURL()
{
	window.open("http://pokerworld.game/");
}