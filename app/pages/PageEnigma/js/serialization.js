import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class SaveManager {
    constructor(version) {
        this.version = version;
        this.scene = null;
    }

    save(scene, scene_callback, audio_manager, timeline, animations) {
        let gltfExporter = new GLTFExporter();
        gltfExporter.parse(
            scene,
            function (gltf) {
                let save_json = {"glb": gltf, "audio": audio_manager.clips, "timeline": timeline}

                // TODO: give the file name via a modal.
                const file = new File([JSON.stringify(gltf)], "test.glb", {type: 'application/json'});
                
                let blobUrl = URL.createObjectURL(file);
                scene_callback(file);

                let a = document.createElement('a');

                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const randomNumber = Math.floor(Math.random() * 1000);
                let save_name = `save_${randomNumber}_${year}${month}${day}_${hours}${minutes}${seconds}.sav`;

                a.href = blobUrl;
                a.download = save_name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            },
            { 
                trs: false,
                onlyVisible: false,
                animations: animations,
                binary: true
            }
    
        );
    }

    load(file, load_callback) {
        let reader = new FileReader();

        reader.onload = function (event) {
            let data = JSON.parse(event.target.result);
            let glb = data.glb;
            let audio = data.audio;
            let timelineData = data.timeline;
            let animationData = data.animations;
    
            let loader = new GLTFLoader();
            
            loader.parse(glb, '', function (gltf) {
                let scene = gltf.scene;
                let clips = audio;
                let timeline = timelineData;
                let animations = animationData;
                load_callback(scene, clips, timeline, animations);
            });
        };
    
        reader.readAsText(file);
    }

    download(data, filename, type) {
        var file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

}

export default SaveManager;
