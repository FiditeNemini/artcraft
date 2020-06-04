use crate::model::model_container::ModelContainer;
use anyhow::{Result, Error};
use std::path::Path;
use std::thread;
use std::time::Duration;
use tch::Tensor;

pub struct ArpabetGlowTtsModel {
  model_container: ModelContainer,
}

impl ArpabetGlowTtsModel {
  pub fn load(filename: &Path) -> Result<Self> {
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

    let lengths_tensor = Tensor::of_slice(&[text_buffer.len() as i64]);

    /*

    "this is the song that never ends"

    x_tst tensor([[ 91, 109, 131,  11, 109, 146,  11,  91,  73,  11, 131,  78, 120,  11,
          91,  70, 133,  11, 119,  94, 143,  97,  11,  94, 119,  90, 146]],
       device='cuda:0')

    x_tst_lengths tensor([27], device='cuda:0')

     */

    /*
    r: Expected tensor for argument #1 \'indices\' to have scalar type Long;
    but got CPUIntType instead (while checking arguments for embedding)\n" }',
    tts_service/src/model/model_container.rs:33:5

    r: Expected tensor for argument #1 \'indices\' to have scalar type Long;
    but got CPUFloatType instead (while checking arguments for embedding)\n" }',
    tts_service/src/model/model_container.rs:33:5
     */

    /*

    tst_stn 39  testing this text to speech generator
    sequence 1 [[ 11 133  94 131 133 108 120  11  91 109 131  11 133  94 116 131 133  11
                  133 141  11 131 129 113  89  11 115  94 119  97 103 133  97  11]]

    x_tst 1 tensor([[ 11, 133,  94, 131, 133, 108, 120,  11,  91, 109, 131,  11, 133,  94,
         116, 131, 133,  11, 133, 141,  11, 131, 129, 113,  89,  11, 115,  94,
         119,  97, 103, 133,  97,  11]])

   x_tst_lengths 1 tensor([34])

     */
   // let text : Vec<i64> = vec![ 91, 109, 131,  11, 109, 146,  11,  91,  73,  11, 131,  78, 120,  11,
   //   91,  70, 133,  11, 119,  94, 143,  97,  11,  94, 119,  90, 146];

    let text : Vec<i64> = vec![11, 133, 94, 131, 133, 108, 120, 11, 91, 109, 131,
      11, 133, 94, 116, 131, 133, 11, 133, 141, 11, 131, 129, 113, 89, 11, 115, 94,
      119, 97, 103, 133, 97, 11];


    //let text : Vec<f32> = text.iter().map(|n| *n as i64).collect();

    //let one_d : Vec<&[i64]> = vec![text.as_slice()];
    //let two_d : &[&[i64]] = one_d.as_slice();

    let x_tst = Tensor::of_slice(&text.as_slice());

    println!("\n\nTensor size: {:?}", x_tst.size());

    let x_tst_2 = x_tst.unsqueeze(0);

    println!("\n\nTensor unsqueezed size: {:?}", x_tst_2.size());

    //let lengths = [27i64];
    let lengths = [34i64];
    let x_tst_lengths = Tensor::of_slice(&lengths);

    self.model_container.forward2(&x_tst_2, &x_tst_lengths)
  }
}
