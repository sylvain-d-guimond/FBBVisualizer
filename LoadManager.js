
function LoadManager(config, cameraManager, scene, onLoadingFinished){
    this.config = config;
    this.cameraManager = cameraManager;
    this.scene = scene;
    this.scenes = [];
    this.cameraScene = null;
    this.assetsManager = new BABYLON.AssetsManager(scene);
    this.onLoadingFinished = onLoadingFinished;
}

LoadManager.prototype.loadScenesFromConfig = function(){
    this.cameraScene = new SceneDef("Cameras","", this.config.paths.camerasURL);

    this.assetsManager.autoHideLoadingUI = false;

    this.loadScenes(this.config.paths.scenes);

    //Load cameras
    if (this.cameraScene.file){
        console.log("Loading cameras:", this.cameraScene.file);
        this.loadAndUseModel(this.scene, this.cameraScene.file, ()=>{
            this.cameraScene.isLoaded = true;
            this.checkIfFinished();
        });
    } else {this.cameraScene.isLoaded = true;}
    //Load other scenes
    console.log("Loading", this.scenes.length, "scenes");
    this.assetsManager.load();
}

LoadManager.prototype.loadScenes = function(scenes){
    scenes.forEach(aScene => {
        let sceneDef = new SceneDef(aScene.name, aScene.path, aScene.file);
        this.loadScene(sceneDef);
    });
    this.assetsManager.load();
}

LoadManager.prototype.loadScene = function(sceneDef){
    console.log("Load scene:", sceneDef.name);
    let loadTask = this.assetsManager.addMeshTask(sceneDef.name + " loading task", "", sceneDef.path, sceneDef.file);
    this.scenes.push(sceneDef);

    loadTask.onSuccess =  (task) => {
        console.log(sceneDef.name, "loaded");
        setMeshesNotClickable(task);
        sceneDef.isLoaded = true;
        sceneDef.meshes = task.loadedMeshes;
        this.checkIfFinished();
    }
}

LoadManager.prototype.checkIfFinished = function() {
    let isFinished = this.cameraScene.isLoaded;
    if (isFinished){
        this.scenes.forEach(scene => {
            isFinished = isFinished && scene.isLoaded;
        })
    }

    if (isFinished){
        this.onLoadingFinished();
    }
}

function SceneDef(name, path, file){
    this.name = name;
    this.path = path;
    this.file = file
    this.meshes = [];
    this.isLoaded = false;
}

LoadManager.prototype.loadAndUseModel = function(scene, url, onFinished) {
    let loadedCamera = null;
    BABYLON.SceneLoader.OnPluginActivatedObservable.addOnce(loader => {
        if (loader.name === 'gltf') {

            //Import cameras from GLTF
            loader.onCameraLoadedObservable.add((camera) => {
                console.log("Found camera:", camera.name, camera);
                if (!cameraManager.sceneCameras.includes(camera)){
                    cameraManager.sceneCameras.push(camera);
                }

                //Convert loaded camera to ArcRotateCamera
                //TODO: find a better way that doesn't create an extra camera
                const arcCamera = new BABYLON.ArcRotateCamera(
                    camera.name,
                    -Math.PI / 4,
                    Math.PI / 2.5,
                    10,
                    camera.lockedTarget, scene);
                arcCamera.wheelPrecision = 50;
                arcCamera.pinchPrecision = 50;
                cameraManager.checkAndAddCamera(arcCamera);
            })

            //Set all meshes as non-pickable by default
            loader.onMeshLoadedObservable.add((mesh) => {
                mesh.isPickable = false;
            })
        }
    })
    //Load scene
    BABYLON.SceneLoader.LoadAssetContainerAsync(url, undefined, scene).then(
        (assetContainer) => {
            assetContainer.addAllToScene();
            this.cameraManager.alignCameras();
            //pipeline.addCamera(cameraManager.flyCam);
                    
            console.log("Set camera limits...");
            getTextFromUrl(config.paths.cameraLimitsURL, function (text){ 
                this.cameraManager.loadCameraLimits(text);
                onFinished();
            });
        },
    )
}

const setMeshesNotClickable = (meshTask) => {
    meshTask.loadedMeshes.forEach((mesh) => {
        mesh.isPickable = false;
    });
}