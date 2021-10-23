function SessionManager(){
    this.config = {};
    this.scene = "";
}

SessionManager.prototype.checkParameters = function(onFinished){
    let parameterString = window.location.search;
    let urlParams = new URLSearchParams(parameterString);

    if (urlParams.has('config')){
        let configUrl = "config/"+urlParams.get('config')+".json";
        getTextFromUrl(configUrl, (text) => {
            this.config = JSON.parse(text);
            console.log("config loaded from", configUrl, ":", this.config);
        })
    }

    if (urlParams.has('scene')){
        let sceneConfigUrl = "config/"+urlParams.get('scene')+".json";
        getTextFromUrl(sceneConfigUrl, (text) => {
            this.scene = JSON.parse(text);
            console.log("scene config loaded from", sceneConfigUrl, ":", this.scene);
            onFinished();
        })
    }

}