function CameraManager(pipeline, postProcess, scene){
    this.cameras = [];
    this.sceneCameras = [];
    this.flyCam = this.setupFlyCam(pipeline, postProcess, scene);
    this.currentCamera = {};
    this.interior = false;
    this.pipeline = pipeline;
    this.postProcess = postProcess;
    this.scene = scene;
}

CameraManager.prototype.checkAndAddCamera = function (cam) {
    this.cameras = this.cameras.filter(exCam => {
        return exCam.name !== cam.name;
    });

    this.cameras.push(cam);
    this.pipeline.addCamera(cam);
    this.postProcess.activate(cam);
}

CameraManager.prototype.alignCameras = function () { 
    this.cameras.forEach(camera => {
        this.alignCamera(camera);
    });
}

CameraManager.prototype.setupFlyCam = function (pipeline, postProcess, scene){
    let flyCam = new BABYLON.FreeCamera("FlyCam", new BABYLON.Vector3(), scene);

    flyCam.minZ = 0.01;

    return flyCam
}

CameraManager.prototype.alignCamera = function (camera) {
    let sceneCam = this.sceneCameras.filter(scCam => {
        return scCam.name === camera.name;
    })[0];
    sceneCam.getWorldMatrix().decompose(null, null, camera.position);
    console.log("Align camera position", camera.name, camera.position);

    var cameraTarget = scene.getTransformNodeByName("Target_"+ sceneCam.name)
    if (cameraTarget){
        var target = new BABYLON.Vector3();
        cameraTarget.getWorldMatrix().decompose(null, null, target);
        console.log("Align camera target:", camera.name, target);
        camera.setTarget(target);
    }
    camera.fov = sceneCam.fov;
}

CameraManager.prototype.setCameraBounds = function (name, xMin, xMax, yMin, yMax, zMin, zMax) {
    var camera = this.cameras.filter(cam => {
        return cam.name === name;
    })[0];

    console.log("Set camera bounds: ", camera);
    while (camera.alpha < xMin){camera.alpha += Math.PI;}
    camera.upperRadiusLimit = zMax;
    camera.lowerRadiusLimit = zMin;
    camera.upperBetaLimit = yMax;
    camera.lowerBetaLimit = yMin;
    camera.upperAlphaLimit = xMax;
    camera.lowerAlphaLimit = xMin;
    camera.pinchPrecision = 500;
    camera.wheelPrecision = 50;
    camera.minZ = 0.01;
}

CameraManager.prototype.setActiveCamera = function (cameraName) {
    var camera = this.cameras.filter(cam => {
        return cam.name === cameraName;
    })[0];

    console.log("Set to camera " , cameraName, camera);
    this.scene.activeCamera.detachControl();
    //this.alignCamera(camera);
    this.scene.activeCamera = camera;
    this.scene.activeCamera.attachControl(canvas, true);
    console.log("Active cam pos", this.scene.activeCamera.position);
    console.log("Active cam target", this.scene.activeCamera.getTarget());

    switches.forEach(aSwitch => 
        aSwitch.setEnabled(!aSwitch.name.includes(this.cameraName))
    );
}

CameraManager.prototype.flyToCamera = function (cameraName) {

    if (this.currentCamera === cameraName) return;

    let sceneCamera = this.sceneCameras.filter(cam => {
        return cam.name === cameraName;
    })[0];
    let newCam = this.cameras.filter(cam => {
        return cam.name === cameraName;
    })[0];

    console.log("Fov: ", this.scene.activeCamera.fov, newCam.fov);
    this.flyCam.position = this.scene.activeCamera.position;
    this.flyCam.rotation = this.scene.activeCamera.rotation;
    this.flyCam.fov = this.scene.activeCamera.fov;
    this.scene.activeCamera.detachControl();

    var animatePosition = new BABYLON.Animation("AnimPosition", "position", 30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keysPosition = [];
    console.log("Animate position from to", this.flyCam.position, newCam.position);
    keysPosition.push({frame: 0, value: this.flyCam.position});
    keysPosition.push({frame: 30, value: newCam.position});
    animatePosition.setKeys(keysPosition);
    var easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animatePosition.setEasingFunction(easing);
    this.flyCam.animations.push(animatePosition);

    var animateRotation = new BABYLON.Animation("AnimRotation", "lockedTarget", 30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keysRotation = [];
    var newTarget = new BABYLON.Vector3();
    //console.log("Camera name:", cameraName, "Target_"+ cameraName,this.scene.getTransformNodeByName("Target_"+ cameraName));
    this.scene.getTransformNodeByName("Target_"+ cameraName).getWorldMatrix().decompose(null, null, newTarget);
    keysRotation.push({frame: 0, value: this.scene.activeCamera.getTarget()});
    keysRotation.push({frame: 30, value: newTarget});
    animateRotation.setKeys(keysRotation);
    animateRotation.setEasingFunction(easing);
    this.flyCam.animations.push(animateRotation);

    var animateFov = new BABYLON.Animation("AnimFov", "fov", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keysFov = [];
    keysFov.push({frame: 0, value: this.scene.activeCamera.fov});
    keysFov.push({frame: 30, value: newCam.fov});
    animateFov.setKeys(keysFov);
    animateFov.setEasingFunction(easing);
    this.flyCam.animations.push(animateFov);

    this.scene.activeCamera = this.flyCam;

    this.scene.beginAnimation(this.flyCam, 0, 30, false, 1, () => {
        var newCam = this.cameras.filter(cam => {
            return cam.name === this.currentCamera;
        });

        this.setActiveCamera(this.currentCamera);
        console.log("Current camera pos: ", scene.activeCamera.position);
        console.log("Current camera target: ", scene.activeCamera.getTarget());
    });
    this.currentCamera = cameraName;
}