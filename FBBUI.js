function FBBUI(){
    this.leftPanel = new BABYLON.GUI.StackPanel();
    this.rightPanel = new BABYLON.GUI.StackPanel();
    this.outsidePanel = new BABYLON.GUI.StackPanel();
    this.extPanel = new BABYLON.GUI.StackPanel();
    this.intPanel = new BABYLON.GUI.StackPanel();
}

FBBUI.prototype.setupUI = function(variantManager, cameraManager){
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //advancedTexture.layer.layerMask = 0x10000000;
    //advancedTexture.renderScale = 1.5;

    this.leftPanel.width = "200px";
    this.leftPanel.isVertical = true;
    this.leftPanel.paddingRight = "20px";
    this.leftPanel.paddingBottom = "20px";
    this.leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(this.leftPanel);

    this.rightPanel.width = "200px";
    this.rightPanel.isVertical = true;
    this.rightPanel.paddingRight = "20px";
    this.rightPanel.paddingBottom = "20px";
    this.rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(this.rightPanel);

    this.outsidePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM

    this.extPanel.height = "80px";
    this.extPanel.paddingBottom = "20px";
    this.extPanel.isVertical = false;
    this.extPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.extPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.outsidePanel.addControl(this.extPanel);
    advancedTexture.addControl(this.outsidePanel);
    
    this.intPanel.height = "0px";
    this.intPanel.paddingTop = "40px";
    this.intPanel.paddingBottom = "20px";
    this.intPanel.isVertical = false;
    this.intPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.intPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.outsidePanel.addControl(this.intPanel);
    advancedTexture.addControl(this.outsidePanel);

    //Exterior options
    addTexturedButton("", () => {
        //variantManager.selectVariant("design101");
        //variantManager.selectVariant("01blue");
        variantManager.setVariantFromConfig("design01");
        }, this.extPanel, "white", "img/Variant_Geo_Plane_Body_Design101.png");
    addTexturedButton("", () => {
        //variantManager.selectVariant("design022");
        //variantManager.selectVariant("03darkblue");
        variantManager.setVariantFromConfig("design02");
        }, this.extPanel, "white", "img/Variant_Geo_Plane_Body_Design022.png");
    addTexturedButton("", () => {
        //variantManager.selectVariant("design003");
        //variantManager.selectVariant("02dark");
        variantManager.setVariantFromConfig("design03");
        }, this.extPanel, "white", "img/Variant_Geo_Plane_Body_Design003.png");
    
    //Interior options
    /*addTexturedButton("", () => {
        variantManager.selectVariant("01black");
        }, this.intPanel, "black", "");
    addTexturedButton("", () => {
        variantManager.selectVariant("02greyblue");
        }, this.intPanel, "blue", "");*/

    //Camera options
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt01");
        this.setExtPanel();
        }, this.leftPanel, "white", "img/CamExt01.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt02");
        this.setExtPanel();
        }, this.leftPanel, "white", "img/CamExt02.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt03");
        this.setExtPanel();
        }, this.leftPanel, "white", "img/CamExt03.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt04");
        this.setExtPanel();
        }, this.leftPanel, "white", "img/CamExt04.png");
    addTexturedButton("", () => {
        //scene.animationGroups.forEach(anim => {anim.start(false, 1, anim.from, anim.to);});
        cameraManager.playAnimation("canopy_open");
        cameraManager.flyToCamera("CamInt02", () => {
            cameraManager.flyToCamera("CamInt01", () =>{
                cameraManager.playAnimation("canopy_close");
            })
        }, 0.75);
        this.setIntPanel();
        }, this.leftPanel, "white", "img/CamInt01.png");
    
    addTexturedButton("", () => {
        let activeCam = cameraManager.scene.activeCamera;
        cameraManager.fade(false, 1, ()=>{
            cameraManager.fade(true, 1);
            cameraManager.playCameraFlight("Dolly_cam", ()=>{
                cameraManager.fade(false, 0, ()=>{
                    cameraManager.setActiveCamera(activeCam);
                    cameraManager.fade(true);
                })
            }, 2)
        });
    }, this.rightPanel, "red", "");
    addTexturedButton("", () => {
        let activeCam = cameraManager.scene.activeCamera;
        cameraManager.fade(false, 1, ()=>{
            cameraManager.fade(true, 1);
            cameraManager.playCameraFlight("Wing_cam", ()=>{
                cameraManager.fade(false, 0, ()=>{
                    cameraManager.setActiveCamera(activeCam);
                    cameraManager.fade(true);
                })
            }, 2)
        });
    }, this.rightPanel, "green", "");
    addTexturedButton("", () => {
        let activeCam = cameraManager.scene.activeCamera;
        cameraManager.fade(false, 1, ()=>{
            cameraManager.fade(true, 1);
            cameraManager.playCameraFlight("Tail_cam", ()=>{
                cameraManager.fade(false, 1, ()=>{
                    cameraManager.setActiveCamera(activeCam);
                    cameraManager.fade(true);
                })
            }, 2)
        });
    }, this.rightPanel, "blue", "");


    /*
    cameraManager.cameras.forEach(camera => {
        addButton(camera.name, () => {cameraManager.flyToCamera(camera.name)}, extPanel, "orange");
    });

    variantManager.groups.forEach(group =>{
        group.variants.forEach(variant =>{
            addButton(group.name + " " + variant.name, () => {variantManager.selectVariant(variant)}, this.leftPanel, (group.type === "mat"?"green":"blue"));
        });
    });*/
}

FBBUI.prototype.setIntPanel = function (){
    this.intPanel.height = "80px";
    this.intPanel.paddingTop = "0px";
    this.extPanel.height = "-80px";
}

FBBUI.prototype.setExtPanel = function (){
    this.intPanel.height = "-80px";
    this.intPanel.paddingTop = "40px";
    this.extPanel.height = "80px";
}



const addTexturedButton = function(text, func, panel, color, texture){
    var button = BABYLON.GUI.Button.CreateImageButton("button", text, texture);
    button.width = "80px"
    button.height = "80px";
    button.color = "white";
    button.cornerRadius = 20;
    button.image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    button.image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    button.image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button.image.scaleX = 6;
    button.image.scaleY = 6;
    button.paddingLeft = "10px";
    button.paddingRight = "10px";
    button.paddingTop = "10px";
    button.paddingBottom = "10px";
    button.background = color;
    button.onPointerUpObservable.add(function(value) {
        func(value);
    });
    panel.addControl(button);  
    //console.log("Scale x y", button.image.scaleX, button.image.scaleY);
}