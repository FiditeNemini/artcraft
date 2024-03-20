import * as THREE from 'three';

class SaveManager {
    constructor(version) {
        this.version = version;
        this.scene = null;
    }

    save(scene, scene_data, characters) {
        let json_data = scene.toJSON();
        let json_string = JSON.stringify({ "scene": json_data, "scene_data": scene_data, "characters": characters});

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const randomNumber = Math.floor(Math.random() * 1000);
        let save_name = `save_${randomNumber}_${year}${month}${day}_${hours}${minutes}${seconds}.json`;

        download(json_string, save_name, "application/json");
    }

    load(uploadedFile, load_callback) {
        let reader = new FileReader();
        reader.readAsText(uploadedFile);
        reader.onload = function (event) {
            let jsonData = JSON.parse(event.target.result);
            let scene = new THREE.ObjectLoader().parse(jsonData["scene"]);
            let scene_data = jsonData["scene_data"];
            let characters = jsonData["characters"];
            load_callback(scene, scene_data, characters);
        };
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
