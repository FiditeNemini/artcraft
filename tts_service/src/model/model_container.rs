use anyhow::Result;
use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;

/// Holds the loaded pytorch JIT model
pub struct ModelContainer {
  filename: String,
  jit_model: CModule,
}

impl ModelContainer {
  pub fn load(filename: &str) -> Result<Self> {
    let model = CModule::load(filename)
        .map_err(|e| anyhow!("jit model failed to load: {}", e))?;

    Ok(Self {
      filename: filename.to_string(),
      jit_model: model,
    })
  }

  pub fn get_filename(&self) -> &str {
    &self.filename
  }

  pub fn forward(&self, tensor: &Tensor) -> Tensor {
    self.jit_model.forward(tensor)
  }
}
