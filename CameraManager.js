function CameraManager(scene, ppMgr, config){
    this.cameras = [];
    this.sceneCameras = [];
    this.currentCamera = {};
    this.interior = false;
    this.postProcess = ppMgr;
    this.config = config;
    this.flyCam = this.setupFlyCam(scene);
    this.scene = scene;
    this.bgColor = scene.clearColor.clone();
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
    this.postProcess.addCamera(cam);

    this.cameras.push(cam);
}

CameraManager.prototype.alignCameras = function () { 
    this.cameras.forEach(camera => {
        this.alignCamera(camera);
    });
}

CameraManager.prototype.setupFlyCam = function (scene){
    //let flyCam = new BABYLON.ArcRotateCamera("FlyCam", 0,0,0,new BABYLON.Vector3(), scene);
    let flyCam = new BABYLON.FreeCamera("FlyCam", new BABYLON.Vector3(), scene);

    flyCam.minZ = 0.01;
    this.postProcess.addCamera(flyCam);

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

CameraManager.prototype.setActiveCamera = function (cameraName, control = true) {
    let camera = {};
    if (typeof cameraName === 'string' || cameraName instanceof String){
        camera = this.cameras.filter(cam => {
            return cam.name === cameraName;
        })[0];
    } else{
        camera = cameraName;
    }

    if (!camera){
        console.log("Camera", cameraName, "not found in loaded cameras, looking in scene");

        camera = scene.cameras.filter(cam =>{
            return cam.name === cameraName;
        })[0];

        if (!camera){
            console.log("Camera", cameraName, "still not found!");
            return;
        }
    }

    console.log("Set to camera " , cameraName, camera);
    this.scene.activeCamera.detachControl();
    this.scene.activeCamera = camera;
    if (control) this.scene.activeCamera.attachControl(canvas, true);

    switches.forEach(aSwitch => 
        aSwitch.setEnabled(!aSwitch.name.includes(this.cameraName))
    );
}

CameraManager.prototype.playAnimation = function(animName, onFinished){
    let anim = this.config.animations.filter(a => {return a.name === animName;})[0];

    let animGrps = [];
    anim.groups.forEach(aGrp => {
        animGrps = animGrps.concat(this.scene.animationGroups.filter(grp => {return grp.name === aGrp;}));
    })

    if (onFinished && animGrps.length > 0) {
        animGrps[0].onAnimationGroupEndObservable.addOnce(()=>onFinished());
    } 

    animGrps.forEach(aGrp => {
        if (anim.speed > 0){
            aGrp.start(false, Math.abs(anim.speed), aGrp.from, aGrp.to);
        } else {
            aGrp.start(false, Math.abs(anim.speed), aGrp.to, aGrp.from);
        }
    })
}

CameraManager.prototype.playCameraFlight = function(flightName, onFinished, speed = 1){
    var flight = config.flights.filter(fl => {
        return fl.name === flightName;
    })[0];

    console.log("Found flights:", flight);

    let animGrps;
    flight.anims.forEach(anim => {
        let anims = scene.animationGroups.filter(a =>{
            //console.log("Match", a.name ===anim,"to animGrp", a, "to name", anim);
            return a.name ===anim;
        });
        console.log("try Cat", animGrps, "to",anims);
        if (animGrps) animGrps = animGrps.concat(anims);
        else animGrps = anims;
    });

    console.log("Found animGrps:", animGrps);

    if (animGrps.length > 0 && onFinished){
        animGrps[0].onAnimationGroupEndObservable.addOnce(()=>onFinished());
    }

    var camera = this.findCamera(flight.camera);
    this.postProcess.addCamera(camera);

    if (flight.fovAnim){
        let anim = this.createFovAnim(flight.fovAnim);
        animGrps[0].addTargetedAnimation(anim, camera);
    }

    animGrps.forEach(anim => anim.start(false, speed, anim.from, anim.to));
    this.setActiveCamera(flight.camera, false);
}

CameraManager.prototype.createFovAnim = function(frames){
    let fovAnim = new BABYLON.Animation("FovAnim", "fov", 25,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keys = [];
    frames.forEach(keyFrame =>{
        keys.push(keyFrame);
    })
    fovAnim.setKeys(keys);
    var easing = new BABYLON.SineEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    fovAnim.setEasingFunction(easing);

    return fovAnim;
}

CameraManager.prototype.findCamera = function(cameraName){
    console.log("Find camera:", cameraName)
    let camera =  this.scene.cameras.filter(cam => {
        return cam.name === cameraName;
    })[0];

    console.log("Found camera:", camera);
    return camera;
}

CameraManager.prototype.fade = function(fadeIn, speed, onFinished) {
    console.log("FadeAnim", this.fadeInAnim);
    //this.fadeAnim.start(true, speed * (fadeIn? 1:-1), 0, 30);
    if (fadeIn) { 
        this.fadeInAnim.onAnimationGroupEndObservable.addOnce(() => {if (onFinished) onFinished();});
        this.fadeInAnim.play(false);
    }
    else {
        this.fadeOutAnim.onAnimationGroupEndObservable.addOnce(() => {if (onFinished) onFinished();});
        this.fadeOutAnim.play(false);
    }

    console.log("FadeAnim finished, scene:", scene);
}

CameraManager.prototype.setupCameraFade = function(ppMgr){
    console.log("PPMGR", ppMgr);
    var fadeInAnim = new BABYLON.Animation("AnimFadeIn", "edgeAmount", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeysIn = [];
    fadeKeysIn.push({frame:0, value: 0});
    fadeKeysIn.push({frame:30, value: 0.36153893103966345});
    fadeInAnim.setKeys(fadeKeysIn);
    var easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    fadeInAnim.setEasingFunction(easing);

    var lightAnimIn = new BABYLON.Animation("AnimLightIn", "colorAmount", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeysLIn = [];
    fadeKeysLIn.push({frame:0, value: 0});
    fadeKeysLIn.push({frame:30, value: 1});
    lightAnimIn.setKeys(fadeKeysLIn);
    lightAnimIn.setEasingFunction(easing);
    
    this.fadeInAnim = new BABYLON.AnimationGroup("FadeIn", this.scene);
    this.fadeInAnim.addTargetedAnimation(fadeInAnim, ppMgr.pipeline.sharpen);
    this.fadeInAnim.addTargetedAnimation(lightAnimIn, ppMgr.pipeline.sharpen);

    console.log("Setup camera fade finished");
    
    var fadeOutAnim = new BABYLON.Animation("AnimFadeOut", "edgeAmount", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeysOut = [];
    fadeKeysOut.push({frame:0, value: 0.36153893103966345});
    fadeKeysOut.push({frame:30, value: 0});
    fadeOutAnim.setKeys(fadeKeysOut);
    fadeOutAnim.setEasingFunction(easing);

    var lightAnimOut = new BABYLON.Animation("AnimLightOut", "colorAmount", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeysLOut = [];
    fadeKeysLOut.push({frame:0, value: 1});
    fadeKeysLOut.push({frame:30, value: 0});
    lightAnimOut.setKeys(fadeKeysLOut);
    lightAnimOut.setEasingFunction(easing);
    
    this.fadeOutAnim = new BABYLON.AnimationGroup("FadeOut", this.scene);
    this.fadeOutAnim.addTargetedAnimation(fadeOutAnim, ppMgr.pipeline.sharpen);
    this.fadeOutAnim.addTargetedAnimation(lightAnimOut, ppMgr.pipeline.sharpen);/*
    var fadeInAnim = new BABYLON.Animation("AnimFadeIn", "clearColor", 30,
        BABYLON.Animation.ANIMATIONTYPE_COLOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeys = [];
    fadeKeys.push({frame:0, value: BABYLON.Color3.BlackReadOnly});
    fadeKeys.push({frame:30, value: this.bgColor});
    fadeInAnim.setKeys(fadeKeys);
    var easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    fadeInAnim.setEasingFunction(easing);

    var lightAnim = new BABYLON.Animation("AnimLightIn", "intensity", 30,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeysL = [];
    fadeKeysL.push({frame:0, value: 0});
    fadeKeysL.push({frame:30, value: 1});
    lightAnim.setKeys(fadeKeysL);
    var easingL = new BABYLON.CubicEase();
    easingL.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    lightAnim.setEasingFunction(easingL);
    
    this.fadeAnim = new BABYLON.AnimationGroup("FadeAnim", this.scene);
    this.fadeAnim.addTargetedAnimation(fadeInAnim, this.scene);
    this.fadeAnim.addTargetedAnimation(lightAnim, this.scene.lights[0])
    /*
    var fadeOutAnim = new BABYLON.Animation("AnimFadeIn", "clearColor", 30,
        BABYLON.Animation.ANIMATIONTYPE_COLOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var fadeKeys = [];
    fadeKeys.push({frame:0, value: this.bgColor});
    fadeKeys.push({frame:30, value: BABYLON.Color3.BlackReadOnly});
    fadeOutAnim.setKeys(fadeKeys);
    var easing = new BABYLON.CubicEase();
    easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    fadeOutAnim.setEasingFunction(easing);*/

    /*this.scene.onBeforeRenderObservable.add(() =>{

    })*/
}

CameraManager.prototype.flyToCamera = function (cameraName, doAfter, speed) {

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

    if (!speed) speed = 1;
    this.scene.beginAnimation(this.flyCam, 0, 30, false, speed, () => {
        /*var newCam = this.cameras.filter(cam => {
            return cam.name === this.currentCamera;
        });*/

        this.setActiveCamera(this.currentCamera);
        if (doAfter) doAfter();
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

CameraManager.prototype.configureCameras = function(){
    /*this.cameras.forEach((camera) =>{
        pipeline.addCamera(camera);
        postProcess.activate(camera);
    });*/

    //pipeline.addCamera(this.flyCam);
    //postProcess.activate(this.flyCam);
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