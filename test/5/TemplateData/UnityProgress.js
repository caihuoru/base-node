function UnityProgress(gameInstance, progress) {
  if (!gameInstance.Module)
    return;
  if (!gameInstance.logo) {
	gameInstance.intro = document.createElement("div");
	gameInstance.intro.className = "intro";
	gameInstance.intro.innerHTML = "From the creators of Governor Of Poker&trade;";
	gameInstance.container.appendChild(gameInstance.intro);
	
    gameInstance.logo = document.createElement("div");
    gameInstance.logo.className = "logo";
    gameInstance.container.appendChild(gameInstance.logo);
  }
  if (!gameInstance.progress)
  {
	gameInstance.progress = document.createElement("div");
    gameInstance.progress.className = "progress";
    gameInstance.progress.empty = document.createElement("div");
    gameInstance.progress.empty.className = "empty";
    gameInstance.progress.appendChild(gameInstance.progress.empty);
    gameInstance.progress.full = document.createElement("div");
    gameInstance.progress.full.className = "full";
    gameInstance.progress.appendChild(gameInstance.progress.full);
	
    gameInstance.progress.loadingText = document.createElement("div");
    gameInstance.progress.loadingText.className = "loadingText";
	gameInstance.progress.loadingText.innerHTML = "Loading...";
    gameInstance.progress.appendChild(gameInstance.progress.loadingText);
	
    gameInstance.container.appendChild(gameInstance.progress);
  }
  gameInstance.progress.full.style.width = (100 * progress) + "%";
  gameInstance.progress.empty.style.width = (100 * (1 - progress)) + "%";
  console.log("progress:"+gameInstance.container);
  
  if (progress == 1){
	//remove loader  
	gameInstance.progress.loadingText.innerHTML = "Unpacking assets...<br/>please wait a few seconds";

    //gameInstance.logo.style.display = gameInstance.progress.style.display = "none";
  }
}