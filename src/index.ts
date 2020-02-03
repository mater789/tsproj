import * as BABYLON from 'babylonjs';
import * as BABYLONLOADER from 'babylonjs-loaders'

class BabylonTest
{
    private m_cCanvas : HTMLCanvasElement;
    private m_cEngine : BABYLON.Engine;
    private m_cScene : BABYLON.Scene;
    private m_cCamera : BABYLON.Camera;
    private m_cLight : BABYLON.DirectionalLight;

    constructor() 
    {
        //canvas    
        let element = document.getElementById("renderCanvas");
        this.m_cCanvas = <HTMLCanvasElement>element;

        //engine
        this.m_cEngine = new BABYLON.Engine(this.m_cCanvas, true, { premultipliedAlpha: false, preserveDrawingBuffer: true });
        this.m_cEngine.enableOfflineSupport = false;
        this.m_cEngine.runRenderLoop(this.Render.bind(this));

        //scene
        this.m_cScene = new BABYLON.Scene(this.m_cEngine);

        //camera
        this.m_cCamera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2,  Math.PI / 4, 5, BABYLON.Vector3.Zero(), this.m_cScene);
        this.m_cCamera.attachControl(this.m_cCanvas, true);
        
        //evr
        this.InitEvr();

        //data
        this.InitData();
    }

    private InitData()
    {
        BABYLON.SceneLoader.Append("./assets/","box.gltf",this.m_cScene,()=>
        {
            this.m_cScene.createDefaultCameraOrLight(true, true, true);
        });
    }

    private InitEvr()
    {
        //gltf
        BABYLONLOADER.GLTFFileLoader.IncrementalLoading = false;
        BABYLONLOADER.GLTFFileLoader._CreateGLTF2Loader = (fileLoader)=>
        {
            return new BABYLONLOADER.GLTF2.GLTFLoader(fileLoader);
        };
        BABYLONLOADER.GLTFFileLoader._CreateGLTF1Loader = (fileLoader)=>
        {
            return new BABYLONLOADER.GLTF1.GLTFLoader();
        };
        BABYLON.SceneLoader.RegisterPlugin(new BABYLONLOADER.GLTFFileLoader());

        //sky cube
        let hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./assets/environmentSpecular.env", this.m_cScene);
        this.m_cScene.createDefaultSkybox(hdrTexture, true,(this.m_cScene.activeCamera.maxZ - this.m_cScene.activeCamera.minZ) / 2, 0.3, false);
        this.m_cScene.environmentTexture = hdrTexture;

        //light
        this.m_cLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, -1), this.m_cScene);
        this.m_cLight.diffuse = new BABYLON.Color3(1, 1, 1);
        this.m_cLight.specular = new BABYLON.Color3(1, 0, 0);
        this.m_cLight.intensity = 1;

        //effect
        var defaultPipeline = new BABYLON.DefaultRenderingPipeline(
            "DefaultRenderingPipeline",
            true, // is HDR?
            this.m_cScene,
            this.m_cScene.cameras
        );
        if (defaultPipeline.isSupported) 
        {
            /* imageProcessing */
            defaultPipeline.imageProcessingEnabled = true; //true by default
            if (defaultPipeline.imageProcessingEnabled) 
            {
                defaultPipeline.imageProcessing.contrast = 1; // 1 by default
                defaultPipeline.imageProcessing.exposure = 1; // 1 by default
                /* color grading */
                defaultPipeline.imageProcessing.colorGradingEnabled = false; // false by default
                if (defaultPipeline.imageProcessing.colorGradingEnabled) {
                    // using .3dl (best) :
                    defaultPipeline.imageProcessing.colorGradingTexture = new BABYLON.ColorGradingTexture("textures/LateSunset.3dl", this.m_cScene);
                    // using .png :
                    /*
                    var colorGradingTexture = new BABYLON.Texture("textures/colorGrade-highContrast.png", scene, true, false);
                    colorGradingTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                    colorGradingTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                    defaultPipeline.imageProcessing.colorGradingTexture = colorGradingTexture;
                    defaultPipeline.imageProcessing.colorGradingWithGreenDepth = false;
                    */
                }
                /* color curves */
                defaultPipeline.imageProcessing.colorCurvesEnabled = false; // false by default
                if (defaultPipeline.imageProcessing.colorCurvesEnabled) 
                {
                    var curve = new BABYLON.ColorCurves();
                    curve.globalDensity = 0; // 0 by default
                    curve.globalExposure = 0; // 0 by default
                    curve.globalHue = 30; // 30 by default
                    curve.globalSaturation = 0; // 0 by default
                    curve.highlightsDensity = 0; // 0 by default
                    curve.highlightsExposure = 0; // 0 by default
                    curve.highlightsHue = 30; // 30 by default
                    curve.highlightsSaturation = 0; // 0 by default
                    curve.midtonesDensity = 0; // 0 by default
                    curve.midtonesExposure = 0; // 0 by default
                    curve.midtonesHue = 30; // 30 by default
                    curve.midtonesSaturation = 0; // 0 by default
                    curve.shadowsDensity = 0; // 0 by default
                    curve.shadowsExposure = 0; // 0 by default
                    curve.shadowsHue = 30; // 30 by default
                    curve.shadowsDensity = 80;
                    curve.shadowsSaturation = 0; // 0 by default;
                    defaultPipeline.imageProcessing.colorCurves = curve;
                }
            }
            /* bloom */
            defaultPipeline.bloomEnabled = false; // false by default
            if (defaultPipeline.bloomEnabled) 
            {
                defaultPipeline.bloomKernel = 64; // 64 by default
                defaultPipeline.bloomScale = 0.5; // 0.5 by default
                defaultPipeline.bloomThreshold = 0.9; // 0.9 by default
                defaultPipeline.bloomWeight = 0.15; // 0.15 by default
            }
            /* chromatic abberation */
            defaultPipeline.chromaticAberrationEnabled = false; // false by default
            if (defaultPipeline.chromaticAberrationEnabled) 
            {
                defaultPipeline.chromaticAberration.aberrationAmount = 30; // 30 by default
                defaultPipeline.chromaticAberration.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.chromaticAberration.alphaMode = 0; // 0 by default
                defaultPipeline.chromaticAberration.alwaysForcePOT = false; // false by default
                defaultPipeline.chromaticAberration.enablePixelPerfectMode = false; // false by default
                defaultPipeline.chromaticAberration.forceFullscreenViewport = true; // true by default
            }
            /* DOF */
            defaultPipeline.depthOfFieldEnabled = false; // false by default
            if (defaultPipeline.depthOfFieldEnabled && defaultPipeline.depthOfField.isSupported) 
            {
                defaultPipeline.depthOfFieldBlurLevel = 0; // 0 by default
                defaultPipeline.depthOfField.fStop = 1.4; // 1.4 by default
                defaultPipeline.depthOfField.focalLength = 50; // 50 by default, mm
                defaultPipeline.depthOfField.focusDistance = 2000; // 2000 by default, mm
                defaultPipeline.depthOfField.lensSize = 50; // 50 by default
            }
            /* FXAA */
            defaultPipeline.fxaaEnabled = false; // false by default
            if (defaultPipeline.fxaaEnabled) 
            {
                defaultPipeline.fxaa.samples = 1; // 1 by default
                defaultPipeline.fxaa.adaptScaleToCurrentViewport = false; // false by default
            }
            /* glowLayer */
            defaultPipeline.glowLayerEnabled = false;
            if (defaultPipeline.glowLayerEnabled) {
                defaultPipeline.glowLayer.blurKernelSize = 16; // 16 by default
                defaultPipeline.glowLayer.intensity = 1; // 1 by default
            }
            /* grain */
            defaultPipeline.grainEnabled = false;
            if (defaultPipeline.grainEnabled) 
            {
                defaultPipeline.grain.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.grain.animated = false; // false by default
                defaultPipeline.grain.intensity = 30; // 30 by default
            }
            /* MSAA */
            defaultPipeline.samples = 4; // 1 by default
            /* sharpen */
            defaultPipeline.sharpenEnabled = false;
            if (defaultPipeline.sharpenEnabled) 
            {
                defaultPipeline.sharpen.adaptScaleToCurrentViewport = false; // false by default
                defaultPipeline.sharpen.edgeAmount = 0.3; // 0.3 by default
                defaultPipeline.sharpen.colorAmount = 1; // 1 by default
            }
        }
    }

    private Render()
    {
        this.m_cScene.render();
    }
}

new BabylonTest();