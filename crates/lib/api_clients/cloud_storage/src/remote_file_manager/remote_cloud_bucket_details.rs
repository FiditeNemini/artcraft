use crate::remote_file_manager::media_descriptor;
use crate::remote_file_manager::weights_descriptor::{self};
use super::file_descriptor::FileDescriptor;

#[derive(Debug, Clone)]
pub struct RemoteCloudBucketDetails {
    pub object_hash: String,
    pub prefix: String,
    pub suffix: String,
}

impl RemoteCloudBucketDetails {
    pub fn new(object_hash: String, prefix: String, suffix: String) -> Self {
        Self {
            object_hash,
            prefix,
            suffix
        }
    }
    pub fn get_object_hash(&self) -> &str {
        &self.object_hash
    }
    pub fn get_prefix(&self) -> &str {
        &self.prefix
    }
    pub fn get_suffix(&self) -> &str {
        &self.suffix
    }

    pub fn file_descriptor_from_bucket_details(&self) -> Box<dyn FileDescriptor> {
        match self.prefix.as_str() {
            // Weights
            "loRA" => Box::new(weights_descriptor::WeightsLoRADescriptor {}),
            "sd15" => Box::new(weights_descriptor::WeightsSD15Descriptor {}),
            "sdxl" => Box::new(weights_descriptor::WeightsSDXLDescriptor {}),
            "valle_prompt" => Box::new(weights_descriptor::WeightsVallePromptDescriptor {}),
            "rvc" => {
                match self.suffix.as_str() {
                    "safetensors" => Box::new(weights_descriptor::WeightsRVCDescriptor {}),
                    "index" => Box::new(weights_descriptor::WeightsRVCIndexDescriptor {}),
                    _ => panic!("Unknown suffix: {}",self.suffix)
                }
            },
            "svc" => Box::new(weights_descriptor::WeightsSVCDescriptor {}),
            "workflow" => Box::new(weights_descriptor::WeightsWorkflowDescriptor {}),
            // Media
            "image" => {
                match self.suffix.as_str() {
                    "png" => Box::new(media_descriptor::MediaImagePngDescriptor {}),
                    _ => panic!("Unknown suffix: {}",self.suffix)
                }
            },
            "video" => {
                match self.suffix.as_str() {
                    "mp4" => Box::new(media_descriptor::MediaVideoMp4Descriptor {}),
                    _ => panic!("Unknown suffix: {}",self.suffix)
                }
            },
            _ => panic!("Unknown prefix: {}", self.prefix)
        }
    }
}


#[cfg(test)]
mod tests {
    #[test]
    pub fn test() {

    }
 
}