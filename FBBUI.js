function FBBUI(){

}

FBBUI.prototype.setupUI = function(variantManager, cameraManager){
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //advancedTexture.layer.layerMask = 0x10000000;
    //advancedTexture.renderScale = 1.5;

    var leftPanel = new BABYLON.GUI.StackPanel();
    leftPanel.width = "200px";
    leftPanel.isVertical = true;
    leftPanel.paddingRight = "20px";
    leftPanel.paddingBottom = "20px";
    leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(leftPanel);

    var outsidePanel = new BABYLON.GUI.StackPanel();
    outsidePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM

    var extPanel = new BABYLON.GUI.StackPanel();
    extPanel.height = "80px";
    extPanel.paddingBottom = "20px";
    extPanel.isVertical = false;
    extPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    extPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    outsidePanel.addControl(extPanel);
    advancedTexture.addControl(outsidePanel);
    
    var intPanel = new BABYLON.GUI.StackPanel();
    intPanel.height = "0px";
    intPanel.paddingTop = "40px";
    intPanel.paddingBottom = "20px";
    intPanel.isVertical = false;
    intPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    intPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    outsidePanel.addControl(intPanel);
    advancedTexture.addControl(outsidePanel);

    addTexturedButton("", () => {
        variantManager.selectVariant("design101");
        variantManager.selectVariant("01blue");
        }, extPanel, "white", "img/Variant_Geo_Plane_Body_Design101.png");
    addTexturedButton("", () => {
        variantManager.selectVariant("design022");
        variantManager.selectVariant("03darkblue");
        }, extPanel, "white", "img/Variant_Geo_Plane_Body_Design022.png");
    addTexturedButton("", () => {
        variantManager.selectVariant("design003");
        variantManager.selectVariant("02dark");
        }, extPanel, "white", "img/Variant_Geo_Plane_Body_Design003.png");
    
    
        addTexturedButton("", () => {
            variantManager.selectVariant("01black");
            }, intPanel, "black", "");
            addTexturedButton("", () => {
                variantManager.selectVariant("02greyblue");
                }, intPanel, "blue", "");

    
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt01");
        intPanel.height = "-80px";
        intPanel.paddingTop = "40px";
        extPanel.height = "80px";
        }, leftPanel, "white", "img/CamExt01.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt02");
        intPanel.height = "-80px";
        intPanel.paddingTop = "40px";
        extPanel.height = "80px";
        }, leftPanel, "white", "img/CamExt02.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt03");
        intPanel.height = "-80px";
        intPanel.paddingTop = "40px";
        extPanel.height = "80px";
        }, leftPanel, "white", "img/CamExt03.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamExt04");
        intPanel.height = "-80px";
        intPanel.paddingTop = "40px";
        extPanel.height = "80px";
        }, leftPanel, "white", "img/CamExt04.png");
    addTexturedButton("", () => {
        cameraManager.flyToCamera("CamInt01");
        intPanel.height = "80px";
        intPanel.paddingTop = "0px";
        extPanel.height = "-80px";
        }, leftPanel, "white", "img/CamInt01.png");
    addTexturedButton("", () => {
        downloadObjectAsJson(config, "config");
        }, leftPanel, "white", "img/CamInt01.png");
    
    /*
    cameraManager.cameras.forEach(camera => {
        addButton(camera.name, () => {cameraManager.flyToCamera(camera.name)}, extPanel, "orange");
    });

    variantManager.groups.forEach(group =>{
        group.variants.forEach(variant =>{
            addButton(group.name + " " + variant.name, () => {variantManager.selectVariant(variant)}, leftPanel, (group.type === "mat"?"green":"blue"));
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
    button.background = color;
    button.onPointerUpObservable.add(function(value) {
        func(value);
    });
    panel.addControl(button);  
    //console.log("Scale x y", button.image.scaleX, button.image.scaleY);
}