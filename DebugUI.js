function DebugUI(){

}

DebugUI.prototype.setupUI = function(variantManager, cameraManager){
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //advancedTexture.layer.layerMask = 0x10000000;
    //advancedTexture.renderScale = 1.5;

    var rightPanel = new BABYLON.GUI.StackPanel();
    rightPanel.width = "300px";
    rightPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    rightPanel.paddingBottom = "20px";
    rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(rightPanel);

    var leftPanel = new BABYLON.GUI.StackPanel();
    leftPanel.width = "300px";
    leftPanel.isVertical = true;
    leftPanel.paddingRight = "20px";
    leftPanel.paddingTop = "20px";
    leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(leftPanel);

    console.log("Add camera debug buttons");
    cameraManager.cameras.forEach(camera => {
        addButton(camera.name, () => {cameraManager.flyToCamera(camera.name)}, leftPanel, "orange");
    });

    console.log("Add variant debug buttons");
    variantManager.groups.forEach(group =>{
        group.variants.forEach(variant =>{
            addButton(group.name + " " + variant.name, () => {variantManager.selectVariant(variant)}, rightPanel, (group.type === "mat"?"green":"blue"));
        });
    });

    console.log("Add animation debug buttons");
    scene.animationGroups.forEach(animGrp => {
        console.log("1");
        addButton("Play " + animGrp.name, () => {animGrp.play();}, leftPanel, "black");
        console.log("2");
        addButton("Stop " + animGrp.name, () => {animGrp.stop();}, leftPanel, "black");
        console.log("3");
        animGrp.loopAnimation = false;
        console.log("4");
        animGrp.stop();
    })
    scene.animationGroups.forEach(animGrp => {
        console.log("1");
        addButton("Play " + animGrp.name, () => {animGrp.start(false, 1, animGrp.to, animGrp.from);}, leftPanel, "black");
        console.log("2");
        addButton("Stop " + animGrp.name, () => {animGrp.stop();}, leftPanel, "black");
        console.log("3");
        animGrp.loopAnimation = false;
        console.log("Speed Ratio", animGrp);
        console.log("4");
        animGrp.stop();
    })
}

const addButton = function(text, func, panel, color){
    var button = BABYLON.GUI.Button.CreateSimpleButton("button", text);
    button.width = "150px"
    button.height = "40px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = color;
    button.onPointerUpObservable.add(function(value) {
        func(value);
    });
    panel.addControl(button);  
}