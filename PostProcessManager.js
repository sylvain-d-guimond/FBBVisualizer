function PostProcessManager(scene, cameraManager){
    this.scene = scene;
    this.pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, cameraManager.cameras);
}