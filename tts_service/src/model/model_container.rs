use anyhow::Result;
use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use std::path::{Path, PathBuf};
use anyhow::Result as AnyhowResult;
use std::fmt::Formatter;

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

  pub fn forward2(&self, arg1: &Tensor, arg2: &Tensor) -> Tensor {
    let result = self.jit_model.forward_ts(&[arg1, arg2]);

    if let Err(err) = result.as_ref() {
      println!("error: {:?}", err);
    }

    result.expect("SHOULD WORK")
  }

  pub fn forward3(&self, arg1: &Tensor, arg2: &Tensor, arg3: &Tensor) -> Tensor {
    let result = self.jit_model.forward_ts(&[arg1, arg2, arg3]);

    if let Err(err) = result.as_ref() {
      println!("error: {:?}", err);
    }

    result.expect("SHOULD WORK")
  }
}
