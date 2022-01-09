function PostProcessManager(scene, settingsUrl){
    this.scene = scene;
    this.pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true);//, scene, cameraManager.cameras);
    getTextFromUrl(settingsUrl, (settingsText) => {
        let settings = JSON.parse(settingsText);
        copySettings(settings, this.pipeline);
        console.log("PP Settings imported");
    })
    this.cameras = [];
}

PostProcessManager.prototype.addCamera = function(camera){
    if (!this.cameras.includes(camera)){
        this.pipeline.addCamera(camera);
        this.cameras.push(camera);
    }
}


PostProcessManager.prototype.setupUI = function(){
    console.log("Setting up Post Processing UI");
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //advancedTexture.layer.layerMask = 0x10000000;
    advancedTexture.renderScale = 1.5;

    console.log("1");
    var rightPanel = new BABYLON.GUI.StackPanel();
    rightPanel.width = "300px";
    rightPanel.isVertical = true;
    rightPanel.paddingRight = "20px";
    rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(rightPanel);

    console.log("2");
    var leftPanel = new BABYLON.GUI.StackPanel();
    leftPanel.width = "300px";
    leftPanel.isVertical = true;
    leftPanel.paddingRight = "20px";
    leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(leftPanel);

    var addCheckbox = function(text, func, initialValue, left, panel) {
        if(!panel){
            panel = leftPanel
        }
        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.width = "20px";
        checkbox.height = "20px";
        checkbox.isChecked = initialValue;
        checkbox.color = "green";
        checkbox.onIsCheckedChangedObservable.add(function(value) {
            func(value);
        });

        var header = BABYLON.GUI.Control.AddHeader(checkbox, text, "280px", { isHorizontal: true, controlFirst: true});
        header.height = "30px";
        header.color = "black";
        header.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        if (left) {
            header.left = left;
        }

        panel.addControl(header);  
    }

    var addSlider = function(text, func, initialValue, min, max, left, panel) {
        if(!panel){
            panel = leftPanel
        }
        var header = new BABYLON.GUI.TextBlock();
        header.text = text;
        header.height = "30px";
        header.color = "black";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(header); 
        if (left) {
            header.left = left;
        }

        var slider = new BABYLON.GUI.Slider();
        slider.minimum = min;
        slider.maximum = max;
        slider.value = initialValue;
        slider.height = "20px";
        slider.color = "green";
        slider.background = "black";
        slider.onValueChangedObservable.add(function(value) {
            func(value);
        });

        if (left) {
            slider.paddingLeft = left;
        }

    panel.addControl(slider);  
    }

    var addColorPicker = function(text, func, initialValue, left, panel) {
        if(!panel){
            panel = leftPanel
        }
        var header = new BABYLON.GUI.TextBlock();
        header.text = text;
        header.height = "30px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(header); 

        if (left) {
            header.left = left;
        }        

        var colorPicker = new BABYLON.GUI.ColorPicker();
        colorPicker.value = initialValue;
        colorPicker.size = "100px";
        colorPicker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        colorPicker.onValueChangedObservable.add(function(value) {
            func(value);
        });

        if (left) {
            colorPicker.left = left;
        }        

        panel.addControl(colorPicker);  
    }
    
    var addButton = function(text, func, panel, color){
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

    console.log("3");
    // Create default pipeline
    var curve = new BABYLON.ColorCurves();
    curve.globalHue = 200;
    curve.globalDensity = 80;
    curve.globalSaturation = 80;
    curve.highlightsHue = 20;
    curve.highlightsDensity = 80;
    curve.highlightsSaturation = -80;
    curve.shadowsHue = 2;
    curve.shadowsDensity = 80;
    curve.shadowsSaturation = 40;
    this.pipeline.imageProcessing.colorCurves = curve;
    this.pipeline.depthOfField.focalLength = 150;

    console.log("4");
    // Add gui for default pipeline effects
    addCheckbox("Multisample Anti-Aliasing", (value) => {
        this.pipeline.samples = this.pipeline.samples == 1 ? 4 : 1;
    }, this.pipeline.samples == 4 );

    addCheckbox("Fast Approximate Anti-Aliasing", (value) => {
        this.pipeline.fxaaEnabled = value;
    }, this.pipeline.fxaaEnabled );
    console.log("5");

    addCheckbox("Tone Mapping", (value) => {
        this.pipeline.imageProcessing.toneMappingEnabled = value;
    }, this.pipeline.imageProcessing.toneMappingEnabled); 

    addSlider("camera contrast", (value) => {
        this.pipeline.imageProcessing.contrast = value;
    }, this.pipeline.imageProcessing.contrast, 0, 4);  

    addSlider("camera exposure", (value) => {
        this.pipeline.imageProcessing.exposure = value;
    }, this.pipeline.imageProcessing.exposure, 0, 4);      

    addCheckbox("Color curves", (value) => {
        this.pipeline.imageProcessing.colorCurvesEnabled = value;
    }, this.pipeline.imageProcessing.colorCurvesEnabled);    

    addCheckbox("Bloom", (value) => {
        this.pipeline.bloomEnabled = value;
    }, this.pipeline.bloomEnabled);    
    addSlider("Kernel", (value) => {
        this.pipeline.bloomKernel = value;
    }, this.pipeline.bloomKernel, 1, 500, "20px");
    addSlider("Weight", (value) => {
        this.pipeline.bloomWeight = value;
    }, this.pipeline.bloomWeight, 0, 1, "20px");
    addSlider("Threshold", (value) => {
        this.pipeline.bloomThreshold = value;
    }, this.pipeline.bloomThreshold, 0, 1, "20px");
    addSlider("Scale", (value) => {
        this.pipeline.bloomScale = value;
    }, this.pipeline.bloomScale, 0.0, 1, "20px");

    addCheckbox("Depth Of Field", (value) => {
        this.pipeline.depthOfFieldEnabled = value;
    }, this.pipeline.depthOfFieldEnabled);

    addSlider("Blur Level", (value) => {
        if(value < 1){
            this.pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
        }else if(value < 2){
            this.pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        }else if(value < 3){
            this.pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.High;
        }
    }, 1, 0, 3, "20px"); 

    addSlider("Focus Distance", (value) => {
        this.pipeline.depthOfField.focusDistance = value;
    }, this.pipeline.depthOfField.focusDistance, 1, 50000, "20px");   

    addSlider("F-Stop", (value) => {
        this.pipeline.depthOfField.fStop = value;
    }, this.pipeline.depthOfField.fStop, 1.0, 10, "20px");   
    
    addSlider("Focal Length", (value) => {
        this.pipeline.depthOfField.focalLength = value;
    }, this.pipeline.depthOfField.focalLength, 1.0, 300, "20px"); 

    leftPanel = rightPanel;

    addCheckbox("Chromatic Aberration", (value) => {
        this.pipeline.chromaticAberrationEnabled = value;
    }, this.pipeline.chromaticAberrationEnabled);    

    addSlider("Amount", (value) => {
        this.pipeline.chromaticAberration.aberrationAmount = value;
    },  0, -1000, 1000, "20px");   
    addSlider("Radial Intensity", (value) => {
        this.pipeline.chromaticAberration.radialIntensity = value;
    },  0, 0.1, 5, "20px");   
    addSlider("Direction", (value) => {
        if(value == 0){
            this.pipeline.chromaticAberration.direction.x = 0
            this.pipeline.chromaticAberration.direction.y = 0
        }else{
            this.pipeline.chromaticAberration.direction.x = Math.sin(value)
            this.pipeline.chromaticAberration.direction.y = Math.cos(value)
        }
        
    },  0, 0, Math.PI*2, "20px"); 
    console.log("6");
    
    addCheckbox("Sharpen", (value) => {
        this.pipeline.sharpenEnabled = value;
    }, this.pipeline.sharpenEnabled);

    addSlider("Edge Amount", (value) => {
        this.pipeline.sharpen.edgeAmount = value;
    }, this.pipeline.sharpen.edgeAmount, 0, 2, "20px");

    addSlider("Color Amount", (value) => {
        this.pipeline.sharpen.colorAmount = value;
    }, this.pipeline.sharpen.colorAmount, 0, 1, "20px");   

    addCheckbox("Vignette", (value) => {
        this.pipeline.imageProcessing.vignetteEnabled = value;
    }, this.pipeline.imageProcessing.vignetteEnabled);     

    addCheckbox("Multiply", (value) => {
        var blendMode = value ? BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_MULTIPLY : BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_OPAQUE;
        this.pipeline.imageProcessing.vignetteBlendMode = blendMode;
    }, this.pipeline.imageProcessing.vignetteBlendMode === BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_MULTIPLY, "40px");     

    addColorPicker("Color", (value) => {
        this.pipeline.imageProcessing.vignetteColor = value;
    }, this.pipeline.imageProcessing.vignetteColor, "20px");    

    addSlider("Weight", (value) => {
        this.pipeline.imageProcessing.vignetteWeight = value;
    }, this.pipeline.imageProcessing.vignetteWeight, 0, 10, "20px");             

    addCheckbox("Grain", (value) => {
        this.pipeline.grainEnabled = value;
    }, this.pipeline.grainEnabled);    

    addSlider("Intensity", (value) => {
        this.pipeline.grain.intensity = value
    }, this.pipeline.grain.intensity, 0, 100, "20px");      

    addCheckbox("Animated", (value) => {
        this.pipeline.grain.animated = value;
    }, this.pipeline.grain.animated, "20px");  

    addButton("Download", () =>{
        let ppSettings = new PostProcessSettings();
        copySettings(this.pipeline, ppSettings)
        console.log("Export pp setings", ppSettings);
        downloadObjectAsJson(ppSettings, "postProcessSettings");
    }, leftPanel, "black")
    
    console.log("7");
}

function PostProcessSettings() {
    this.samples;
    this.fxaaEnabled;
    let toneMappingEnabled;
    let contrast;
    let exposure;
    let colorCurvesEnabled;
    let colorCurves;
    let vignetteEnabled;
    let vignetteBlendMode;
    let vignetteColor;
    let vignetteWeight;
    this.imageProcessing = {toneMappingEnabled, contrast, exposure, colorCurvesEnabled, colorCurves, vignetteEnabled, vignetteBlendMode, vignetteColor, vignetteWeight};
    this.bloomEnabled;
    this.bloomKernel;
    this.bloomWeight;
    this.bloomThreshold;
    this.bloomScale;
    this.depthOfFieldEnabled;
    this.depthOfFieldEffectBlurLevel;
    let focusDistance;
    let fStop;
    let focalLength;
    this.depthOfField = {focusDistance, fStop, focalLength};
    this.chromaticAberrationEnabled;
    let aberrationAmount;
    let radialIntensity;
    let x;
    let y;
    let direction = {x, y};
    this.chromaticAberration = {aberrationAmount, radialIntensity, direction};
    this.sharpenEnabled;
    let edgeAmount;
    let colorAmount;
    this.sharpen = {edgeAmount, colorAmount};
    this.grainEnabled;
    let intensity;
    let animated;
    this.grain = {intensity, animated};
}

function copySettings(from, to){
    console.log("Copy from", from, "to", to);
    to.samples = from.samples;
    to.fxaaEnabled = from.fxaaEnabled;
    to.imageProcessing.toneMappingEnabled = from.imageProcessing.toneMappingEnabled;
    to.imageProcessing.contrast = from.imageProcessing.contrast;
    to.imageProcessing.exposure = from.imageProcessing.exposure;
    to.imageProcessing.colorCurvesEnabled = from.imageProcessing.colorCurvesEnabled;
    to.imageProcessing.colorCurves = from.imageProcessing.colorCurves;
    to.bloomEnabled = from.bloomEnabled;
    to.bloomKernel = from.bloomKernel;
    to.bloomWeight = from.bloomWeight;
    to.bloomThreshold = from.bloomThreshold;
    to.bloomScale = from.bloomScale;
    to.depthOfFieldEnabled = from.depthOfFieldEnabled;
    to.depthOfFieldEffectBlurLevel = from.depthOfFieldEffectBlurLevel;
    to.depthOfField.focusDistance = from.depthOfField.focusDistance;
    to.depthOfField.fStop = from.depthOfField.fStop;
    to.depthOfField.focalLength = from.depthOfField.focalLength;
    to.chromaticAberrationEnabled = from.chromaticAberrationEnabled;
    to.chromaticAberration.aberrationAmount = from.chromaticAberration.aberrationAmount;
    to.chromaticAberration.radialIntensity = from.chromaticAberration.radialIntensity;
    to.chromaticAberration.direction = from.chromaticAberration.direction;
    to.chromaticAberration.direction.x = from.chromaticAberration.direction.x;
    to.chromaticAberration.direction.y = from.chromaticAberration.direction.y;
    to.sharpenEnabled = from.sharpenEnabled;
    to.sharpen.edgeAmount = from.sharpen.edgeAmount;
    to.sharpen.colorAmount = from.sharpen.colorAmount;
    to.imageProcessing.vignetteEnabled = from.imageProcessing.vignetteEnabled;
    to.imageProcessing.vignetteBlendMode = from.imageProcessing.vignetteBlendMode;
    to.imageProcessing.vignetteColor = from.imageProcessing.vignetteColor;
    to.imageProcessing.vignetteWeight = from.imageProcessing.vignetteWeight;
    to.grainEnabled = from.grainEnabled;
    to.grain.intensity = from.grain.intensity;
    to.grain.animated = from.grain.animated;
}