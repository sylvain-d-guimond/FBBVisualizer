function FBBUI(){

}

FBBUI.prototype.setupUI = function(variantManager, cameraManager){
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //advancedTexture.layer.layerMask = 0x10000000;
    //advancedTexture.renderScale = 1.5;

    var rightPanel = new BABYLON.GUI.StackPanel();
    rightPanel.width = "300px";
    rightPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    rightPanel.paddingBottom = "20px";
    rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(rightPanel);

    var outsidePanel = new BABYLON.GUI.StackPanel();
    outsidePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM

    var bottomPanel = new BABYLON.GUI.StackPanel();
    bottomPanel.height = "80px";
    bottomPanel.paddingBottom = "20px";
    bottomPanel.isVertical = false;
    bottomPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    bottomPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    outsidePanel.addControl(bottomPanel);
    advancedTexture.addControl(outsidePanel);

    addTexturedButton("", () => {
        variantManager.selectVariant("design101");
        variantManager.selectVariant("01blue");
        }, bottomPanel, "white", "img/Variant_Geo_Plane_Body_Design101.png");
    addTexturedButton("", () => {
        variantManager.selectVariant("design022");
        variantManager.selectVariant("03darkblue");
        }, bottomPanel, "white", "img/Variant_Geo_Plane_Body_Design022.png");
    addTexturedButton("", () => {
        variantManager.selectVariant("design003");
        variantManager.selectVariant("02dark");
        }, bottomPanel, "white", "img/Variant_Geo_Plane_Body_Design003.png");

    
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt01");
        }, rightPanel, "white", "img/CamExt01.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt02");
        }, rightPanel, "white", "img/CamExt02.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt03");
        }, rightPanel, "white", "img/CamExt03.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt04");
        }, rightPanel, "white", "img/CamExt04.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamInt01");
        }, rightPanel, "white", "img/CamInt01.png");
    /*
    cameraManager.cameras.forEach(camera => {
        addButton(camera.name, () => {cameraManager.flyToCamera(camera.name)}, bottomPanel, "orange");
    });

    variantManager.groups.forEach(group =>{
        group.variants.forEach(variant =>{
            addButton(group.name + " " + variant.name, () => {variantManager.selectVariant(variant)}, rightPanel, (group.type === "mat"?"green":"blue"));
        });
    });*/
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
    //button.background = color;
    button.onPointerUpObservable.add(function(value) {
        func(value);
    });
    panel.addControl(button);  
    console.log("Scale x y", button.image.scaleX, button.image.scaleY);
}