import * as THREE from 'three';

class TransformObject {
    constructor(uuid) {
        this.name = "Transform";
        this.uuid = uuid;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Vector3(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);
    }

    get_json() {
        return { "name": this.name, "object": this.object, "position": this.position, "rotation": this.rotation, "scale": this.scale }
    }

    get_html() {
        return `<div class="component">
        <a>`+ this.name + `</a>
        <hr>
        <span> Demo Position: `+ this.position.toArray() + `</span><br>
        <span> Demo Rotation: `+ this.rotation.toArray() + `</span><br>
        <span> Demo Scale: `+ this.scale.toArray() + `</span>
    </div>`;
    }
}

class Animation {
    constructor(clip) {
        this.name = "Animation";
        this.clip = clip;
    }
}

class Audio {
    constructor(audio_file) {
        this.name = "Audio Player";
        this.audio_file = audio_file;
    }
}

export default TransformObject;
