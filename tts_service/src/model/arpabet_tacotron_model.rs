use crate::model::model_container::ModelContainer;
use anyhow::Result;
use tch::Tensor;

pub struct ArpabetTacotronModel {
  model_container: ModelContainer,
}

impl ArpabetTacotronModel {
  pub fn load(filename: &str) -> Result<Self> {
    let model_container = ModelContainer::load(filename)?;
    Ok(Self {
      model_container,
    })
  }

  pub fn encoded_arpabet_to_mel(&self, text_buffer: &Vec<i64>) -> Tensor {
    let text_tensor = Tensor::of_slice(text_buffer.as_slice());
    println!("Text tensor: {:?}", text_tensor);

    let text_tensor = text_tensor.unsqueeze(0);
    println!("Text tensor unsq: {:?}", text_tensor);

    // This produces the mel, though it will require processing before
    // sending it to MelGan.
    self.model_container.forward(&text_tensor)
  }
}
