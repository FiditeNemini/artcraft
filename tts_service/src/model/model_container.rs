use anyhow::Result;
use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;
use std::path::{Path, PathBuf};

/// Holds the loaded pytorch JIT model
pub struct ModelContainer {
  filename: PathBuf,
  jit_model: CModule,
}

impl ModelContainer {
  pub fn load(filename: &Path) -> Result<Self> {
    let model = CModule::load(filename)
        .map_err(|e| anyhow!("jit model failed to load: {}", e))?;

    Ok(Self {
      filename: filename.to_path_buf(),
      jit_model: model,
    })
  }

  pub fn get_filename(&self) -> &Path {
    &self.filename
  }

  pub fn forward(&self, tensor: &Tensor) -> Tensor {
    self.jit_model.forward(tensor)
  }
}
