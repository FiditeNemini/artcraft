use std::path::{Path, PathBuf};
use anyhow::anyhow;
use log::info;
use errors::AnyhowResult;
use filesys::check_directory_exists::check_directory_exists;
use filesys::check_file_exists::check_file_exists;
use crate::util::comfy_workflows::load_json::load_json;

pub struct ComfyWorkflowStyleBuilder {
  pub style_path: PathBuf,
  pub mapping_directory: PathBuf,
  pub workflow_directory: PathBuf,
}

pub struct StyleMapper {
  // Stage 2
  pub style_json: serde_json::Value, // TODO(bt,2024-03-15): Load a precise schema for styles
  pub mapping_json: serde_json::Value, // TODO(bt,2024-03-15): Load a precise schema for mappings
  pub workflow_json: serde_json::Value, // NB: Workflows cannot have a static schema
}

impl ComfyWorkflowStyleBuilder {
  pub fn new<P: AsRef<Path>, Q: AsRef<Path>, R: AsRef<Path>>(
    style_path: P,
    mapping_directory: Q,
    workflow_directory: R
  ) -> Self {
    Self {
      style_path: style_path.as_ref().to_path_buf(),
      mapping_directory: mapping_directory.as_ref().to_path_buf(),
      workflow_directory: workflow_directory.as_ref().to_path_buf(),
    }
  }

  pub fn build(self) -> AnyhowResult<StyleMapper> {
    check_file_exists(&self.style_path)?;
    check_directory_exists(&self.mapping_directory)?;
    check_directory_exists(&self.workflow_directory)?;

    // TODO(bt,2024-03-15): Load a precise schema for styles
    let style_json = load_json(&self.style_path)?;

    // ===== Mappings =====

    let mapping_filename = style_json.get("mapping_name")
        .ok_or(anyhow!("mapping_name not found in style file"))?
        .as_str()
        .ok_or(anyhow!("mapping_name is not a string"))?;

    info!("mapping filename: {:?}", mapping_filename);

    let mapping_path = self.workflow_directory.join(mapping_filename);

    check_file_exists(&mapping_path)?;

    // TODO(bt,2024-03-15): Load a precise schema for mappings
    let mapping_json= load_json(mapping_path)?;

    // ===== Workflow =====

    let workflow_filename = style_json.get("workflow_api_name")
        .ok_or(anyhow!("workflow_api_name not found in style file"))?
        .as_str()
        .ok_or(anyhow!("workflow_api_name is not a string"))?;

    info!("workflow filename: {:?}", workflow_filename);

    let workflow_path = self.workflow_directory.join(workflow_filename);

    check_file_exists(&workflow_path)?;

    let workflow_json= load_json(workflow_path)?;

    Ok(StyleMapper {
      style_json,
      mapping_json,
      workflow_json,
    })
  }
}

#[cfg(test)]
mod tests {
  use std::path::PathBuf;
  use crate::util::comfy_workflows::comfy_workflow_style_builder::ComfyWorkflowStyleBuilder;

  fn test_path(path_from_repo_root: &str) -> PathBuf {
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(format!("../../../../{}", path_from_repo_root));
    path
  }

  #[test]
  fn test_file_loading() {
    let json_directory = test_path("test_data/comfy_workflows/style_replacement_tests");
    let json_directory = json_directory.canonicalize().expect("should canonicalize");
    let style_path = json_directory.join("5_ghibli_anime_model.json");

    let builder = ComfyWorkflowStyleBuilder::new(
      style_path,
      &json_directory,
      &json_directory
    );

    let result = builder.build();

    if let Err(error) = result {
      println!("error: {:?}", error);
      assert!(false);
    }
  }


}

