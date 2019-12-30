use tch::Tensor;
use tch::CModule;
use tch;
use tch::nn::Module;

/// Load a Torch model
pub fn load_model(filename: &str) -> CModule {
  println!("Loading model: {}", filename);
  tch::CModule::load(filename).unwrap()
}

/// This is a _HACK_ to load a single Tensor.
///
/// It seems currently impossible to load tensors into tch.rs (libtorch),
/// (eg with 'Tensor::load(filename)') that are saved from pytorch. They
/// use different serialization formats. Luckily, I can embed a tensor in
/// a JIT module and unpack it from there instead. The most
/// straightforward way of getting it out is to define a 'forward()'
/// method that simply returns the wrapped tensor.
///
/// I wrote a script to wrap tensors: 'jit_containerize_tensor.py'.
pub fn load_wrapped_tensor(filename: &str) -> Tensor {
  println!("Loading wrapped tensor file: {}", filename);
  let module = tch::CModule::load(filename).unwrap();
  let mut temp = Tensor::zeros(
    &[10, 10, 10],
    (tch::Kind::Float, tch::Device::Cpu)
  );
  module.forward(&temp)
}
