import React from "react";
import AudioCard from "./AudioCard";
import ImageCard from "./ImageCard";
import VideoCard from "./VideoCard";
import BVHCard from "./BVHCard";
import GLBCard from "./GLBCard";
import GLTFCard from "./GLTFCard";
import FBXCard from "./FBXCard";
import SceneRonCard from "./SceneRonCard";
import SceneJSONCard from "./SceneJSONCard";

interface Props {
  props: any;
  type: string;
}

export default function MediaCards({ props, type }: Props) {
  switch (type) {
    case "audio":
      return <AudioCard {...props} />;
    case "image":
      return <ImageCard {...props} />;
    case "bvh":
      return <BVHCard {...props} />;
    case "glb":
      return <GLBCard {...props} />;
    case "gltf":
      return <GLTFCard {...props} />;
    case "fbx":
      return <FBXCard {...props} />;
    case "scene_ron":
      return <SceneRonCard {...props} />;
    case "scene_json":
      return <SceneJSONCard {...props} />;
    case "video":
      return <VideoCard {...props} />;
    default:
      return <div>Unsupported media type</div>;
  }
}
