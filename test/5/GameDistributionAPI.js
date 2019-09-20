let settings = {
    // This is the gameId you get when you've create a game on gamedistribution.com
    gameId: "f07403fb3a4e4278944d0b540a6de3ff",    

    // Along with the gameid you'll also be supplied a userId, put it here
    userId: "8A6A56AB-5A61-4D90-969F-3AE37407AE4E-s1",

    // This function will be called when the ad begins and when your game should be paused. It's required that you mute your game at this point
    pauseGame: function () {
        gameInstance.SendMessage('GameManager', 'PauseGame');
    },

    // This callback is called when the ad is finished, you can resume your game and unmute your audio
    resumeGame: function () {
		if (gameInstance)
        gameInstance.SendMessage('GameManager', 'ResumeGame');
    },

    // Called when the gdApi initlialized, will be deprecated soon
    onInit: function (data) {
        console.log("Init: ", data);
    },

    // Called when an error appears in the gdApi, will be deprecated soon
    onError: function (data) {
        console.log("Error: ", data);
    }
};

//Include the gdApi script
(function(i,s,o,g,r,a,m){
    i['GameDistribution']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)};i[r].l=1*new Date();a=s.createElement(o);m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a, m);
})(window, document, 'script', '//html5.api.gamedistribution.com/libs/gd/api.js', 'gdApi');


//Initialize the gdApi script with the previously defined settings
gdApi(settings);

function ShowAd()
{
    gdApi.showBanner();
}