use std::path::{Path, PathBuf};
use anyhow::anyhow;
use jsonpath_lib::JsonPathError;
use log::{error, info};
use serde_json::Value;
use errors::AnyhowResult;
use filesys::check_directory_exists::check_directory_exists;
use filesys::check_file_exists::check_file_exists;
use mysql_queries::payloads::generic_inference_args::workflow_payload::NewValue;
use crate::util::comfy_workflows::load_json::load_json;

pub struct ComfyWorkflowStyleBuilder {
  pub style_path: PathBuf,
  pub mapping_directory: PathBuf,
  pub workflow_directory: PathBuf,
}

pub struct ComfyWorkflowStyle {
  pub final_workflow_json: Value, // NB: Workflows cannot have a static schema
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

  pub fn build(self) -> AnyhowResult<ComfyWorkflowStyle> {
    let builder_stage = StageOneJsonLoader::build_from(self)?;
    let builder_stage = StageTwoJsonLoader::build_from(builder_stage)?;
    let builder_stage = StageThreeStyleMapper::build_from(builder_stage)?;

    Ok(ComfyWorkflowStyle {
      final_workflow_json: builder_stage.workflow_json,
    })
  }
}

pub struct StageOneJsonLoader {
  style_json: Value, // TODO(bt,2024-03-15): Load a precise schema for styles
  mapping_directory: PathBuf,
  workflow_directory: PathBuf,
}

impl StageOneJsonLoader {
  pub fn build_from(builder: ComfyWorkflowStyleBuilder) -> AnyhowResult<Self> {
    let style_path = builder.style_path;
    let mapping_directory = builder.mapping_directory;
    let workflow_directory = builder.workflow_directory;

    check_file_exists(&style_path)?;
    check_directory_exists(&mapping_directory)?;
    check_directory_exists(&workflow_directory)?;

    let style_json = load_json(&style_path)?;

    Ok(Self {
      style_json,
      mapping_directory,
      workflow_directory,
    })
  }
}

// Stage 2
struct StageTwoJsonLoader {
  style_json: Value, // TODO(bt,2024-03-15): Load a precise schema for styles
  mapping_json: Value, // TODO(bt,2024-03-15): Load a precise schema for mappings
  workflow_json: Value, // NB: Workflows cannot have a static schema
}

impl StageTwoJsonLoader {
  fn build_from(builder: StageOneJsonLoader) -> AnyhowResult<Self> {
    let style_json = builder.style_json;
    let mapping_directory = builder.mapping_directory;
    let workflow_directory = builder.workflow_directory;

    // ===== Mappings =====

    let mapping_filename = Self::load_string_from_json(&style_json, "mapping_name")?;
    info!("mapping filename: {:?}", mapping_filename);
    let mapping_path = mapping_directory.join(mapping_filename);
    check_file_exists(&mapping_path)?;
    let mapping_json= load_json(mapping_path)?;

    // ===== Workflow =====

    let workflow_filename = Self::load_string_from_json(&style_json, "workflow_api_name")?;
    info!("workflow filename: {:?}", workflow_filename);
    let workflow_path = workflow_directory.join(workflow_filename);
    check_file_exists(&workflow_path)?;
    let workflow_json= load_json(workflow_path)?;

    Ok(Self {
      style_json,
      mapping_json,
      workflow_json,
    })
  }

  fn load_string_from_json(json: &Value, key_name: &str) -> AnyhowResult<&str> {
    Ok(json.get(key_name)
        .ok_or(anyhow!("{} not found in json", key_name))?
        .as_str()
        .ok_or(anyhow!("{} is not a json string", key_name))?)
  }
}


// Stage 3
struct StageThreeStyleMapper {
  style_json: Value, // TODO(bt,2024-03-15): Load a precise schema for styles
  mapping_json: Value, // TODO(bt,2024-03-15): Load a precise schema for mappings
  workflow_json: Value, // NB: Workflows cannot have a static schema
}


impl StageThreeStyleMapper {
  fn build_from(builder: StageTwoJsonLoader) -> AnyhowResult<Self> {
    let style_json = builder.style_json;
    let mapping_json = builder.mapping_json;
    let workflow_json = builder.workflow_json;

    let mut modified_workflow_json = workflow_json.clone();

    let style_modifications_map = style_json.get("modifications")
        .ok_or(anyhow!("modifications not found in style json"))?
        .as_object()
        .ok_or(anyhow!("style modifications is not an object"))?;

    let mapping_table = mapping_json
        .as_object()
        .ok_or(anyhow!("mapping_json is not an object at root level"))?;

    for (key, new_value) in style_modifications_map.iter() {
      info!("processing modification key: {:?}", key);

      if key == "loras" {
        info!("skipping loras");
        continue;
      }

      let json_path_address = match mapping_table.get(key) {
        None => {
          error!("key not found in mapping_json mapping table: {:?}", key);
          return Err(anyhow!("key not found in mapping_json mapping table: {:?}", key));
        }
        Some(mapping_address) => {
          // NB: The mapping address will be a string key encoding JSONPath
          // e.g. "$.772.inputs.value"
          mapping_address.as_str()
              .ok_or(anyhow!("mapping address is not a string for key: {:?}, value: {:?}",
                key, mapping_address))?
        }
      };

      info!("json_path_address: {:?}", json_path_address);

      modified_workflow_json = {
        let result =
            jsonpath_lib::replace_with(modified_workflow_json, json_path_address, &mut |_| {
              Some(new_value.clone())
            });

        match result {
          Ok(value) => value,
          Err(err) => {
            error!("json path error for key {:?} and path {:?}: {:?}", key, json_path_address, err);
            return Err(anyhow!("json path error for key {:?} and path {:?}: {:?}", key, json_path_address, err));
          }
        }
      };

    }

    Ok(Self {
      style_json,
      mapping_json,
      workflow_json: modified_workflow_json,
    })
  }
}

#[cfg(test)]
mod tests {
  use std::path::PathBuf;
  use crate::util::comfy_workflows::comfy_workflow_style_builder::{ComfyWorkflowStyleBuilder, StageOneJsonLoader, StageThreeStyleMapper, StageTwoJsonLoader};

  fn test_path(path_from_repo_root: &str) -> PathBuf {
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(format!("../../../../{}", path_from_repo_root));
    path
  }

  fn get_builder() -> ComfyWorkflowStyleBuilder {
    let json_directory = test_path("test_data/comfy_workflows/style_replacement_tests");
    let json_directory = json_directory.canonicalize().expect("should canonicalize");
    let style_path = json_directory.join("5_ghibli_anime_model.json");
    ComfyWorkflowStyleBuilder::new(
      style_path,
      &json_directory,
      &json_directory
    )
  }

  #[test]
  fn test_stage_1_style_file_loading() {
    let builder = get_builder();
    let result = StageOneJsonLoader::build_from(builder);

    if let Err(error) = result {
      println!("error: {:?}", error);
      assert!(false);
    }
  }

  #[test]
  fn test_stage_2_workflow_and_mapper_file_loading() {
    let builder = get_builder();
    let builder = StageOneJsonLoader::build_from(builder).expect("should build stage 1");
    let result = StageTwoJsonLoader::build_from(builder);

    if let Err(error) = result {
      println!("error: {:?}", error);
      assert!(false);
    }
  }

  #[test]
  fn test_stage_3_json_key_mapping() {
    let builder = get_builder();
    let builder = StageOneJsonLoader::build_from(builder).expect("should build stage 1");
    let builder = StageTwoJsonLoader::build_from(builder).expect("should build stage 2");
    let result = StageThreeStyleMapper::build_from(builder);

    if let Err(error) = result {
      println!("error: {:?}", error);
      assert!(false);
    }
  }
}

