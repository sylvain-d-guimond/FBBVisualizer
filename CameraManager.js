function CameraManager(pipeline, postProcess, scene){
    this.cameras = [];
    this.sceneCameras = [];
    this.freeCam = {};
    this.flyCam = this.setupFlyCam(pipeline, postProcess, scene);
    this.currentCamera = {};
    this.interior = false;
    this.pipeline = pipeline;
    this.postProcess = postProcess;
    this.scene = scene;
}

CameraManager.prototype.loadCameraLimits = function(cameraLimits){
    //console.log("Reading camera limits:", cameraLimits);
    var limits = JSON.parse(cameraLimits).cameraLimits;

    //console.log("Read camera limits:", limits);
    limits.forEach(limit => {
        this.setCameraBounds(limit.name, limit.panLeft*(Math.PI/180), limit.panRight*(Math.PI/180), limit.tiltDown*(Math.PI/180), limit.tiltUp*(Math.PI/180), limit.zoomNear, limit.zoomFar, limit.panSpeed, limit.tiltSpeed);
    });
}

CameraManager.prototype.checkAndAddCamera = function (cam) {
    this.cameras = this.cameras.filter(exCam => {
        return exCam.name !== cam.name;
    });

    this.cameras.push(cam);
}

CameraManager.prototype.alignCameras = function () { 
    this.cameras.forEach(camera => {
        this.alignCamera(camera);
    });
}

CameraManager.prototype.setupFlyCam = function (pipeline, postProcess, scene){
    //let flyCam = new BABYLON.ArcRotateCamera("FlyCam", 0,0,0,new BABYLON.Vector3(), scene);
    let flyCam = new BABYLON.FreeCamera("FlyCam", new BABYLON.Vector3(), scene);

    flyCam.minZ = 0.01;

    this.freeCam = new BABYLON.FreeCamera("FreeCam", new BABYLON.Vector3(), scene);

    return flyCam
}

CameraManager.prototype.alignCamera = function (camera) {
    console.log("Align Camera", camera.name)
    let sceneCam = this.sceneCameras.filter(scCam => {
        return scCam.name === camera.name;
    })[0];
    sceneCam.getWorldMatrix().decompose(null, null, camera.position);
    //console.log("Align camera position", camera.name, camera.position);

    var cameraTarget = scene.getTransformNodeByName("Target_"+ sceneCam.name)
    if (cameraTarget){
        var target = new BABYLON.Vector3();
        cameraTarget.getWorldMatrix().decompose(null, null, target);
        //console.log("Align camera target:", camera.name, target);
        camera.setTarget(target);
    }
    camera.fov = sceneCam.fov;
}

CameraManager.prototype.setCameraBounds = function (name, xMin, xMax, yMin, yMax, zMin, zMax, xSpeed, ySpeed) {
    var camera = this.cameras.filter(cam => {
        return cam.name === name;
    })[0];

    console.log("Set camera bounds for", name, ":", camera);
    if (camera){
        while (camera.alpha < xMin){camera.alpha += Math.PI;}
        camera.upperRadiusLimit = zMax;
        camera.lowerRadiusLimit = zMin;
        camera.upperBetaLimit = yMax;
        camera.lowerBetaLimit = yMin;
        if (xMax < 2*Math.PI-0.1) camera.upperAlphaLimit = xMax;
        if (xMin > -(2*Math.PI-0.1)) camera.lowerAlphaLimit = xMin;
        camera.pinchPrecision = 1000;
        camera.pinchDeltaPercentage = 0.0005;
        camera.wheelPrecision = 100;
        camera.minZ = 0.01;
        camera.panningDistanceLimit = 0.0001;
        camera.angularSensibilityX = xSpeed*2000;
        camera.angularSensibilityY = ySpeed*1000;
    }

    this.scene.activeCamera = camera;
}

CameraManager.prototype.copyCameraProperties = function (from, to){
    /*to.alpha = from.alpha;
    to.beta = from.beta;
    to.radius = from.radius;
    to.fov = from.fov;*/
    to.upperRadiusLimit = from.upperRadiusLimit;
    to.lowerRadiusLimit = from.lowerRadiusLimit;
    to.upperBetaLimit = from.upperBetaLimit;
    to.lowerBetaLimit = from.lowerBetaLimit;
    to.upperAlphaLimit = from.upperAlphaLimit;
    to.lowerAlphaLimit = from.lowerAlphaLimit;
    to.pinchPrecision = from.pinchPrecision;
    to.pinchDeltaPercentage = from.pinchDeltaPercentage;
    to.wheelPrecision = from.wheelPrecision;
    to.minZ = from.minZ;
    to.panningDistanceLimit = from.panningDistanceLimit;
    to.angularSensibilityX = from.angularSensibilityX;
    to.angularSensibilityY = from.angularSensibilityY;
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
    //console.log("Active cam pos", this.scene.activeCamera.position);
    //console.log("Active cam target", this.scene.activeCamera.getTarget());

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
    //this.copyCameraProperties(this.freeCam, this.flyCam);

    var animatePosition = new BABYLON.Animation("AnimPosition", "position", 30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keysPosition = [];
    console.log("Animate position from to", this.scene.activeCamera.position, newCam.position);
    keysPosition.push({frame: 0, value: this.scene.activeCamera.position});
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

    console.log("Animate fov from", this.scene.activeCamera.fov, "to", newCam.fov);
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
        /*var newCam = this.cameras.filter(cam => {
            return cam.name === this.currentCamera;
        });*/

        this.setActiveCamera(this.currentCamera);
        //this.copyCameraProperties(newCam, this.flyCam);
        //this.scene.activeCamera.attachControl(canvas, true);
        //console.log("Current camera pos: ", scene.activeCamera.position);
        //console.log("Current camera target: ", scene.activeCamera.getTarget());
        console.log("New cam after flight:", this.scene.activeCamera);
    });
    this.currentCamera = cameraName;
    //console.log("Active cam", this.scene.activeCamera);
    //console.log("Fly cam", this.flyCam);
}

CameraManager.prototype.configureCameras = function(pipeline, postProcess){
    this.cameras.forEach((camera) =>{
        pipeline.addCamera(camera);
        postProcess.activate(camera);
    });

    pipeline.addCamera(this.flyCam);
    postProcess.activate(this.flyCam);
    console.log("Cameras Configured")
}

CameraManager.prototype.setupReflections = function(config){
    console.log("Setting up", config.reflections.length, "reflections");
    config.reflections.forEach((reflection) => {
        var reflector = scene.meshes.filter(aMesh =>{
            return aMesh.name === reflection.target;
        });

        if (reflector.length > 0){
            reflector = reflector[0];

            console.log("ReflectionTexture", reflector.material);

            var probe = new BABYLON.ReflectionProbe("reflectionProbe", 512, scene);
            probe.renderList.push(reflector);
            reflector.material.reflectionTexture = new BABYLON.MirrorTexture(reflection.target, 1024, scene, true);
            reflector.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0.1);
            reflection.reflectedObjects.forEach(reflectedObj => {
                var reflectedMesh = scene.meshes.filter(aMesh =>{
                    return aMesh.name === reflectedObj;
                });

                if (reflectedMesh.length > 0){
                    reflector.material.reflectionTexture.renderList.push(reflectedMesh[0]);
                    probe.renderList.push(reflectedMesh);
                } else {
                    console.log("Can't find reflected mesh", reflectedObj);
                }
            });
            reflector.material.reflectionTexture.level = reflection.level;
        } else{
            console.log("Can't find reflecting mesh", reflection.target);
        }
    })
}