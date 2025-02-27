use super::schedulers::{betas_for_alpha_bar, BetaSchedule, PredictionType, TimestepSpacing};
use candle::{Result, Tensor, IndexOp, Device, DType, Shape};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LCMVarianceType {
  FixedSmall,
  FixedSmallLog,
  FixedLarge,
  FixedLargeLog,
  Learned,
}

impl Default for LCMVarianceType {
  fn default() -> Self {
    Self::FixedSmall
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LCMSolverType {
  Default,
  LogRho,
}

impl Default for LCMSolverType {
  fn default() -> Self {
    Self::Default
  }
}

#[derive(Debug, Clone)]
pub struct LCMSchedulerConfig {
  /// The value of beta at the beginning of training.
  pub beta_start: f64,
  /// The value of beta at the end of training.
  pub beta_end: f64,
  /// How beta evolved during training.
  pub beta_schedule: BetaSchedule,
  /// Option to predicted sample between -1 and 1 for numerical stability.
  pub clip_sample: bool,
  /// Option to clip the variance used when adding noise to the denoised sample.
  pub variance_type: LCMVarianceType,
  /// prediction type of the scheduler function
  pub prediction_type: PredictionType,
  /// number of diffusion steps used to train the model.
  pub train_timesteps: usize,
  /// time step spacing for the diffusion process
  pub timestep_spacing: TimestepSpacing,
  /// Original training steps
  pub original_inference_steps: usize,
  /// Timestep scaling factor (default: 10.0 in diffusers)
  pub timestep_scaling: f64,
  /// Adjust the indexes of the inference schedule by this value.
  pub steps_offset: usize,
  /// The solver type to use for the diffusion process
  pub solver_type: LCMSolverType,
}

impl Default for LCMSchedulerConfig {
  fn default() -> Self {
    Self { beta_start: 0.00085, beta_end: 0.012, beta_schedule: BetaSchedule::ScaledLinear, clip_sample: false, variance_type: LCMVarianceType::FixedSmall, prediction_type: PredictionType::Epsilon, train_timesteps: 1000, timestep_spacing: TimestepSpacing::Leading, original_inference_steps: 50, timestep_scaling: 10.0, steps_offset: 1, solver_type: LCMSolverType::Default }
  }
}

pub struct LCMScheduler {
  alphas_cumprod: Vec<f64>,
  init_noise_sigma: f64,
  timesteps: Vec<usize>,
  step_ratio: usize,
  pub config: LCMSchedulerConfig,
  step_index: Option<usize>,
  begin_index: Option<usize>,
  dtype: DType,
}

impl LCMScheduler {
  pub fn new(inference_steps: usize, config: LCMSchedulerConfig) -> Result<Self> {
    // Set up the correct betas
    let betas = match config.beta_schedule {
      BetaSchedule::ScaledLinear => {
        // LCM uses scaled_linear specifically this way
        let start = config.beta_start.sqrt();
        let end = config.beta_end.sqrt();
        let betas = super::utils::linspace(start, end, config.train_timesteps)?;
        betas.sqr()?
      },
      // Other schedules...
      _ => unreachable!("LCM needs ScaledLinear"),
    };

    // Set up alphas exactly as in diffusers
    let betas = betas.to_vec1::<f64>()?;
    let alphas = betas.iter().map(|beta| 1.0 - beta).collect::<Vec<_>>();

    let mut alphas_cumprod = Vec::with_capacity(alphas.len());
    let mut alpha_prod = 1.0;
    for alpha in alphas.iter() {
      alpha_prod *= alpha;
      alphas_cumprod.push(alpha_prod);
    }

    // Create timesteps based on TimestepSpacing, similar to DDIM
    let step_ratio = config.train_timesteps / inference_steps;
    let timesteps: Vec<usize> = match config.timestep_spacing {
      TimestepSpacing::Leading => (0..(inference_steps)).map(|s| s * step_ratio + config.steps_offset).rev().collect(),
      TimestepSpacing::Trailing => std::iter::successors(Some(config.train_timesteps), |n| if *n > step_ratio { Some(n - step_ratio) } else { None }).map(|n| n - 1).collect(),
      TimestepSpacing::Linspace => super::utils::linspace(0.0, (config.train_timesteps - 1) as f64, inference_steps)?.to_vec1::<f64>()?.iter().map(|&f| f as usize).rev().collect(),
    };

    println!("Using LCM timesteps with {:?} spacing: {:?}", config.timestep_spacing, timesteps);

    let init_noise_sigma = 1.0;

    Ok(Self { alphas_cumprod, init_noise_sigma, timesteps, step_ratio, config, step_index: None, begin_index: None, dtype: DType::F32 })
  }

  pub fn with_dtype(mut self, dtype: DType) -> Self {
    self.dtype = dtype;
    self
  }

  fn get_variance(&self, timestep: usize) -> f64 {
    let prev_t = timestep as isize - self.step_ratio as isize;
    let alpha_prod_t = self.alphas_cumprod[timestep];
    let alpha_prod_t_prev = if prev_t >= 0 { self.alphas_cumprod[prev_t as usize] } else { 1.0 };
    let current_beta_t = 1. - alpha_prod_t / alpha_prod_t_prev;

    // For t > 0, compute predicted variance βt (see formula (6) and (7) from [the pdf](https://arxiv.org/pdf/2006.11239.pdf))
    // and sample from it to get previous sample
    // x_{t-1} ~ N(pred_prev_sample, variance) == add variance to pred_sample
    let variance = (1. - alpha_prod_t_prev) / (1. - alpha_prod_t) * current_beta_t;

    // retrieve variance
    match self.config.variance_type {
      LCMVarianceType::FixedSmall => variance.max(1e-20),
      // for rl-diffuser https://arxiv.org/abs/2205.09991
      LCMVarianceType::FixedSmallLog => {
        let variance = variance.max(1e-20).ln();
        (variance * 0.5).exp()
      },
      LCMVarianceType::FixedLarge => current_beta_t,
      LCMVarianceType::FixedLargeLog => current_beta_t.ln(),
      LCMVarianceType::Learned => variance,
    }
  }

  pub fn timesteps(&self) -> &[usize] {
    self.timesteps.as_slice()
  }

  ///  Ensures interchangeability with schedulers that need to scale the denoising model input
  /// depending on the current timestep.
  pub fn scale_model_input(&self, sample: Tensor, timestep: usize) -> Tensor {
    // LCM doesn't apply any special scaling to model inputs
    println!("LCM: No scaling applied to model input for timestep {}", timestep);
    sample
  }

  fn get_scalings_for_boundary_condition_discrete(&self, timestep: usize) -> (f64, f64) {
    // LCM uses a fixed sigma_data value of 0.5
    let sigma_data = 0.5f64;

    // Timestep scaling factor from diffusers configuration
    let timestep_scaling = self.config.timestep_scaling;

    // In diffusers, they don't use the timestep value directly
    let alpha_cumprod = self.alphas_cumprod[timestep];
    let sqrt_alpha_prod = alpha_cumprod.sqrt();
    let sqrt_one_minus_alpha_prod = (1.0 - alpha_cumprod).sqrt();

    // This is the key calculation - convert alpha to sigma space with scaling
    let scaled_timestep = sqrt_one_minus_alpha_prod / sqrt_alpha_prod * timestep_scaling;

    println!("Boundary condition for timestep={}: scaled_t={} (with scaling={})", timestep, scaled_timestep, timestep_scaling);

    // Calculate boundary condition coefficients with scaled timestep
    let c_skip = sigma_data.powf(2.0) / (scaled_timestep.powf(2.0) + sigma_data.powf(2.0));
    let c_out = scaled_timestep / (scaled_timestep.powf(2.0) + sigma_data.powf(2.0)).sqrt();

    (c_skip, c_out)
  }

  pub fn step(&mut self, model_output: &Tensor, timestep: usize, sample: &Tensor) -> Result<Tensor> {
    // Initialize step_index if it's not already set
    if self.step_index.is_none() {
      self.init_step_index(timestep)?;
      println!("Initialized step_index to {} for timestep {}", self.step_index.unwrap(), timestep);
    }

    // Get current timestep index
    let timestep_index = self.step_index.unwrap();

    // Calculate prev_timestep_index
    let prev_timestep_index = timestep_index + 1;
    let prev_timestep = if prev_timestep_index >= self.timesteps.len() {
      0 // Final step
    } else {
      self.timesteps[prev_timestep_index]
    };

    // Update step_index for next time
    self.step_index = Some(prev_timestep_index);

    // Choose solver based on configuration
    match self.config.solver_type {
      LCMSolverType::Default => self.step_default(model_output, timestep, prev_timestep, sample),
      LCMSolverType::LogRho => self.step_logrho(model_output, timestep, prev_timestep, sample),
    }
  }

  // Default solver (existing logic moved to a separate method)
  fn step_default(&self, model_output: &Tensor, timestep: usize, prev_timestep: usize, sample: &Tensor) -> Result<Tensor> {
    // Get dtype from sample and use it for consistency
    let target_dtype = sample.dtype();
    let device = sample.device();

    println!("Step (Default): current_t={}, prev_t={}", timestep, prev_timestep);

    // Convert model output to match sample dtype
    let model_output = model_output.to_dtype(target_dtype)?;

    // Get the exact alpha values for this timestep
    let alpha_prod_t = if timestep < self.alphas_cumprod.len() {
      self.alphas_cumprod[timestep]
    } else {
      println!("Warning: Timestep {} out of range, using last alpha", timestep);
      *self.alphas_cumprod.last().unwrap()
    };

    // Get the previous alpha value
    let alpha_prod_t_prev = if prev_timestep == 0 {
      1.0 // Final step goes to alpha=1
    } else if prev_timestep < self.alphas_cumprod.len() {
      self.alphas_cumprod[prev_timestep]
    } else {
      println!("Warning: Prev timestep {} out of range", prev_timestep);
      *self.alphas_cumprod.last().unwrap()
    };

    // Calculate coefficients for boundary conditions
    let (c_skip, c_out) = self.get_scalings_for_boundary_condition_discrete(timestep);

    // Compute predicted original sample from noise prediction
    let pred_original_sample = match self.config.prediction_type {
      PredictionType::Epsilon => {
        let beta_prod_t = 1.0 - alpha_prod_t;
        let beta_prod_t_sqrt = beta_prod_t.sqrt();

        let scaled_noise = model_output.affine(beta_prod_t_sqrt, 0.0)?;
        let diff = (sample - &scaled_noise)?;
        diff.affine(1.0 / alpha_prod_t.sqrt(), 0.0)?
      },
      PredictionType::Sample => model_output.clone(),
      PredictionType::VPrediction => {
        let sqrt_alpha_prod = alpha_prod_t.sqrt();
        let sqrt_one_minus_alpha_prod = (1.0 - alpha_prod_t).sqrt();

        let term1 = sample.affine(sqrt_alpha_prod, 0.0)?;
        let term2 = model_output.affine(sqrt_one_minus_alpha_prod, 0.0)?;
        (term1 - term2)?
      },
      _ => unreachable!(),
    };

    // Apply possible clipping
    let pred_orig = if self.config.clip_sample { pred_original_sample.clamp(-1f32, 1f32)? } else { pred_original_sample };

    // Apply boundary condition
    let term1 = pred_orig.affine(c_out, 0.0)?;
    let term2 = sample.affine(c_skip, 0.0)?;
    let denoised = (&term1 + &term2)?;

    // Set up the previous sample
    let pred_prev_sample = if prev_timestep == 0 {
      denoised.clone()
    } else {
      let prev_sqrt_alpha = alpha_prod_t_prev.sqrt();
      denoised.affine(prev_sqrt_alpha, 0.0)?
    };

    Ok(pred_prev_sample)
  }

  // LogRho solver implementation
  fn step_logrho(&self, model_output: &Tensor, timestep: usize, prev_timestep: usize, sample: &Tensor) -> Result<Tensor> {
    // Ensure consistent dtype by getting it from the sample
    let target_dtype = sample.dtype();
    let device = sample.device();

    println!("Step (LogRho): current_t={}, prev_t={}", timestep, prev_timestep);
    println!("  Using target dtype: {:?}", target_dtype);

    // Convert model output to match sample dtype
    let model_output = model_output.to_dtype(target_dtype)?;
    println!("  model_output dtype after conversion: {:?}", model_output.dtype());

    // Get alpha values
    let alpha_prod_t = if timestep < self.alphas_cumprod.len() { self.alphas_cumprod[timestep] } else { *self.alphas_cumprod.last().unwrap() };

    let alpha_prod_t_prev = if prev_timestep == 0 {
      1.0
    } else if prev_timestep < self.alphas_cumprod.len() {
      self.alphas_cumprod[prev_timestep]
    } else {
      *self.alphas_cumprod.last().unwrap()
    };

    // Special case: if we're at the last timestep, return the predicted sample directly
    if prev_timestep == 0 {
      // Handle final step differently - exact same implementation as in default solver
      return self.step_default(&model_output, timestep, prev_timestep, sample);
    }

    // Calculate sigma values for LogRho solver with numerical stability
    let sigma_t = ((1.0 - alpha_prod_t).max(1e-12)).sqrt();
    let sigma_t_prev = ((1.0 - alpha_prod_t_prev).max(1e-12)).sqrt();

    // Calculate key logrho parameters with numerical stability
    let logrho_t = sigma_t.ln() - alpha_prod_t.sqrt().max(1e-12).ln();
    let logrho_t_prev = sigma_t_prev.ln() - alpha_prod_t_prev.sqrt().max(1e-12).ln();

    // Calculate h parameter (step size in log rho space)
    let h = logrho_t_prev - logrho_t;
    let exp_h = h.exp().clamp(0.01, 5.0); // Constrain to a reasonable range
    println!("  LogRho params: h={:.6}, exp(h)={:.6}", h, exp_h);

    // For epsilon prediction we need to transform the model output
    let score = match self.config.prediction_type {
      PredictionType::Epsilon => {
        // For ε prediction type, score is -σ/√α_t * ε
        let scale = -sigma_t / alpha_prod_t.sqrt().max(1e-12);
        model_output.affine(scale, 0.0)?.to_dtype(target_dtype)?
      },
      PredictionType::VPrediction => {
        // model_output is already in the right form
        model_output.clone()
      },
      PredictionType::Sample => {
        // Score = (x_t - √α_t * x_0) / σ_t
        let alpha_sqrt = alpha_prod_t.sqrt();
        let scaled_pred = model_output.affine(alpha_sqrt, 0.0)?.to_dtype(target_dtype)?;
        let diff = (sample.clone() - scaled_pred)?.to_dtype(target_dtype)?;
        diff.affine(1.0 / sigma_t, 0.0)?.to_dtype(target_dtype)?
      },
      _ => unreachable!(),
    };

    println!("  score dtype: {:?}", score.dtype());

    // Calculate d term: d = x_t + σ_t^2/√α_t * score
    let scale_d = sigma_t.powi(2) / alpha_prod_t.sqrt().max(1e-12);
    let score_scaled = score.affine(scale_d, 0.0)?.to_dtype(target_dtype)?;
    let d = (sample + score_scaled)?.to_dtype(target_dtype)?;
    println!("  d dtype: {:?}", d.dtype());

    // Apply the main update formula directly:
    // x_prev = exp_h * sample + sigma_prev * (1 - exp_h) * d

    // First part: exp_h * sample
    let term1 = sample.affine(exp_h, 0.0)?.to_dtype(target_dtype)?;
    println!("  term1 dtype: {:?}", term1.dtype());

    // Second part: sigma_prev * (1 - exp_h) * d
    let term2_factor = sigma_t_prev * (1.0 - exp_h);
    println!("  term2_factor: {:.6}", term2_factor);

    let term2 = d.affine(term2_factor, 0.0)?.to_dtype(target_dtype)?;
    println!("  term2 dtype: {:?}", term2.dtype());

    // Add the terms together
    let pred_prev_sample = (&term1 + &term2)?.to_dtype(target_dtype)?;
    println!("  pred_prev_sample dtype: {:?}", pred_prev_sample.dtype());

    Ok(pred_prev_sample)
  }

  pub fn add_noise(&self, original_samples: &Tensor, noise: Tensor, timestep: usize) -> Result<Tensor> {
    // Get the correct alpha value
    let alpha_cumprod = self.alphas_cumprod[timestep];

    println!("Adding noise for timestep={}, alpha={:.6}, sqrt(alpha)={:.6}", timestep, alpha_cumprod, alpha_cumprod.sqrt());
    println!("  original_samples: shape={:?}, dtype={:?}", original_samples.shape(), original_samples.dtype());
    println!("  noise: shape={:?}, dtype={:?}", noise.shape(), noise.dtype());

    // Keep operations in original_samples' dtype for now
    let target_dtype = original_samples.dtype();
    let noise = noise.to_dtype(target_dtype)?;

    // Calculate coefficients
    let sqrt_alpha = alpha_cumprod.sqrt();
    let sqrt_one_minus_alpha = (1.0 - alpha_cumprod).sqrt();

    // Apply noise formula
    let scaled_samples = original_samples.affine(sqrt_alpha, 0.0)?;
    let scaled_noise = noise.affine(sqrt_one_minus_alpha, 0.0)?;

    println!("  scaled_samples: shape={:?}, dtype={:?}", scaled_samples.shape(), scaled_samples.dtype());
    println!("  scaled_noise: shape={:?}, dtype={:?}", scaled_noise.shape(), scaled_noise.dtype());

    // Add scaled noise - should maintain dtype
    let result = scaled_samples.add(&scaled_noise)?;

    println!("  result: shape={:?}, dtype={:?}", result.shape(), result.dtype());

    Ok(result)
  }

  pub fn init_noise_sigma(&self) -> f64 {
    self.init_noise_sigma
  }

  pub fn alphas_cumprod(&self) -> &[f64] {
    &self.alphas_cumprod
  }

  pub fn log_config(&self) {
    println!("LCM Scheduler Configuration:");
    println!("  beta_start: {}", self.config.beta_start);
    println!("  beta_end: {}", self.config.beta_end);
    println!("  beta_schedule: {:?}", self.config.beta_schedule);
    println!("  train_timesteps: {}", self.config.train_timesteps);
    println!("  prediction_type: {:?}", self.config.prediction_type);
    println!("  clip_sample: {}", self.config.clip_sample);
    println!("  variance_type: {:?}", self.config.variance_type);
    println!("  timesteps: {:?}", self.timesteps);
    // Print the first few alphas_cumprod values
    let num_to_show = std::cmp::min(10, self.alphas_cumprod.len());
    println!("  First {} alphas_cumprod: {:?}", num_to_show, self.alphas_cumprod.iter().take(num_to_show).collect::<Vec<_>>());
  }

  /// Creates embeddings from guidance scale values, similar to timestep embeddings
  /// Based on diffusers implementation
  pub fn get_guidance_scale_embedding(&self, guidance_scale: f64, embedding_dim: usize, device: &Device, dtype: DType) -> Result<Tensor> {
    // Scale by exactly 1000.0 to match diffusers
    let w = guidance_scale * 1000.0;
    println!("Creating guidance embedding with dim={}, scaled value={}", embedding_dim, w);

    // Create embedding vector directly to avoid tensor operations
    let mut embedding = Vec::with_capacity(embedding_dim);
    let half_dim = embedding_dim / 2;

    // Compute the position frequencies
    for i in 0..half_dim {
      let freq = (i as f32) * (-((10000.0f32).ln()) / ((half_dim - 1) as f32));
      let freq = freq.exp();

      // Apply the guidance scale (w value)
      let value = w as f32 * freq;

      // Add sin and cos values
      embedding.push(value.sin());
      embedding.push(value.cos());
    }

    // If odd dimension, pad with zero
    if embedding.len() < embedding_dim {
      embedding.push(0.0);
    }

    // Ensure we have the correct length
    assert_eq!(embedding.len(), embedding_dim, "Embedding length mismatch");

    // Create tensor from the embedding vector
    let tensor = Tensor::new(embedding.as_slice(), device)?.to_dtype(dtype)?;

    // Reshape to match expected [1, embedding_dim] shape
    let result = tensor.reshape((1, embedding_dim))?;

    println!("Final guidance embedding shape: {:?}", result.shape());

    Ok(result)
  }

  /// Calculate timesteps based on LCM's specific formula
  /// This is now only used for backward compatibility or custom timesteps
  pub fn get_timesteps_for_steps(inference_steps: usize) -> Vec<usize> {
    match inference_steps {
      // 4 => vec![999, 499, 259, 0],
      4 => vec![499, 259],
      8 => vec![999, 879, 759, 639, 499, 379, 259, 139, 0],
      _ => {
        let intervals = (999 / (inference_steps - 1)) as usize;
        let mut timesteps = Vec::with_capacity(inference_steps);

        // First step always starts at 999
        timesteps.push(999);

        // Generate intermediate steps
        for i in 1..inference_steps {
          // The pattern looks approximately linear with a step size determined by the number of steps
          let ts = 999 - i * intervals;
          timesteps.push(ts);
        }

        // Last step is always 0
        if let Some(last) = timesteps.last_mut() {
          if *last != 0 {
            *last = 0;
          }
        }

        timesteps
      },
    }
  }

  /// Get the appropriate starting timestep based on strength
  pub fn get_timestep_for_strength(&self, strength: f64) -> (usize, f64) {
    // Convert strength to a timestep index
    let num_steps = self.timesteps.len();
    let strength_adjusted = (strength * num_steps as f64).floor() as usize;
    let start_idx = num_steps.saturating_sub(strength_adjusted + 1);

    // Get the timestep at this index
    let timestep = if start_idx < self.timesteps.len() { self.timesteps[start_idx] } else { *self.timesteps.first().unwrap_or(&999) };

    // Get the corresponding alpha
    let alpha = if timestep < self.alphas_cumprod.len() { self.alphas_cumprod[timestep] } else { *self.alphas_cumprod.last().unwrap_or(&0.0) };

    println!("For strength {:.2}, using timestep {} (index {}), alpha={:.6}", strength, timestep, start_idx, alpha);

    (timestep, alpha)
  }

  /// Add noise for img2img based on strength
  pub fn add_noise_for_img2img(&mut self, original_samples: &Tensor, noise: &Tensor, strength: f64) -> Result<(Tensor, usize)> {
    // Get starting timestep and alpha
    let (timestep, alpha) = self.get_timestep_for_strength(strength);

    // Set begin_index based on this timestep
    let start_idx = self.index_for_timestep(timestep)?;
    self.set_begin_index(start_idx);

    println!("Adding img2img noise with strength={:.4}, timestep={}, alpha={:.6}", strength, timestep, alpha);
    println!("  original_samples: shape={:?}, dtype={:?}", original_samples.shape(), original_samples.dtype());
    println!("  noise: shape={:?}, dtype={:?}", noise.shape(), noise.dtype());

    // Keep operations in original_samples' dtype for now
    let target_dtype = original_samples.dtype();
    let noise_converted = noise.to_dtype(target_dtype)?;

    // Calculate coefficients
    let sqrt_alpha = alpha.sqrt();
    let sqrt_one_minus_alpha = (1.0 - alpha).sqrt();

    println!("  Using scalar multiplication with target dtype={:?}", target_dtype);

    // Apply noise formula
    let scaled_samples = original_samples.affine(sqrt_alpha, 0.0)?;
    let scaled_noise = noise_converted.affine(sqrt_one_minus_alpha, 0.0)?;

    println!("  scaled_samples: shape={:?}, dtype={:?}", scaled_samples.shape(), scaled_samples.dtype());
    println!("  scaled_noise: shape={:?}, dtype={:?}", scaled_noise.shape(), scaled_noise.dtype());

    // Add scaled noise - should maintain dtype
    let noised = scaled_samples.add(&scaled_noise)?;

    println!("  noised: shape={:?}, dtype={:?}", noised.shape(), noised.dtype());

    // Return noised image and the timestep to start from
    Ok((noised, timestep))
  }

  pub fn index_for_timestep(&self, timestep: usize) -> Result<usize> {
    // Collect all indices where timestep matches
    let indices: Vec<usize> = self.timesteps.iter().enumerate().filter_map(|(idx, &ts)| if ts == timestep { Some(idx) } else { None }).collect();

    if indices.is_empty() {
      return Err(candle::Error::Msg(format!("Timestep {} not found in scheduler timesteps", timestep)));
    }

    // Take the second index if there are multiple matches, otherwise take the first
    let pos = if indices.len() > 1 { 1 } else { 0 };
    Ok(indices[pos])
  }

  pub fn set_begin_index(&mut self, begin_index: usize) {
    self.begin_index = Some(begin_index);
    println!("Set begin_index to {}", begin_index);
  }

  pub fn init_step_index(&mut self, timestep: usize) -> Result<usize> {
    self.step_index = if let Some(begin_index) = self.begin_index {
      // If begin_index is set, use it directly
      Some(begin_index)
    } else {
      // Otherwise find the index based on the timestep
      // Find the position of timestep in self.timesteps
      let pos = self.timesteps.iter().position(|&t| t == timestep).ok_or_else(|| candle::Error::Msg(format!("Timestep {} not found in timesteps", timestep)))?;
      Some(pos)
    };

    Ok(self.step_index.unwrap())
  }

  // Updated helper function to match diffusers' get_timesteps logic exactly
  pub fn retrieve_timesteps(scheduler: &mut LCMScheduler, num_inference_steps: usize, strength: Option<f64>, custom_timesteps: Option<Vec<usize>>) -> Result<Vec<usize>> {
    // 1. When custom timesteps are provided, use them directly
    if let Some(custom_ts) = custom_timesteps {
      println!("Using custom timesteps: {:?}", custom_ts);
      return Ok(custom_ts);
    }

    // 2. Get timesteps from scheduler
    let mut timesteps = scheduler.timesteps().to_vec();

    // 3. For img2img, adjust timesteps based on strength
    if let Some(strength) = strength {
      if strength < 1.0 {
        // Match diffusers logic exactly:
        // init_timestep = min(int(num_inference_steps * strength), num_inference_steps)
        let init_timestep = ((num_inference_steps as f64 * strength).floor() as usize).min(num_inference_steps);

        // t_start = max(num_inference_steps - init_timestep, 0)
        let t_start = num_inference_steps.saturating_sub(init_timestep);

        // In diffusers, order is typically 1 for LCM, so we'll simplify here
        let scheduler_order = 1;
        let start_idx = t_start * scheduler_order;

        // Slice timesteps from the calculated start position
        if start_idx < timesteps.len() {
          println!("Adjusting timesteps for strength {}: starting at index {} (init_timestep={})", strength, start_idx, init_timestep);
          timesteps = timesteps[start_idx..].to_vec();

          // Set begin_index in the scheduler
          scheduler.set_begin_index(start_idx);
        }

        // Return the actual number of inference steps we'll perform
        let actual_steps = num_inference_steps.saturating_sub(t_start);
        println!("Will perform {} inference steps due to strength {}", actual_steps, strength);
      }
    }

    println!("Final timesteps for inference: {:?}", timesteps);
    Ok(timesteps)
  }

  // Add this method to help initialize latents from an image (for img2img)
  pub fn prepare_img2img_latents(
    &mut self,
    image_tensor: &Tensor, // Encoded image from VAE
    timestep: usize,
    batch_size: usize,
    num_images_per_prompt: usize,
    dtype: DType,
    device: &Device,
  ) -> Result<Tensor> {
    // Store the dtype for consistent operations
    self.dtype = dtype;

    let latent_dim = image_tensor.dim(2)? / 8; // Assuming standard VAE downsampling

    println!("Preparing img2img latents for timestep={}", timestep);
    println!("  image_tensor: shape={:?}, dtype={:?}", image_tensor.shape(), image_tensor.dtype());

    // Create noise tensor using the same approach as in main.rs
    let noise_shape = Shape::from((batch_size * num_images_per_prompt, 4, latent_dim, latent_dim));
    let noise = Tensor::randn(0f32, 1f32, noise_shape, device)?.to_dtype(dtype)?;
    println!("  noise: shape={:?}, dtype={:?}", noise.shape(), noise.dtype());

    // Encode image to latents
    let encoded_latents = image_tensor.clone(); // Assuming already encoded

    // Scale to match VAE expected scale - use affine for scalar multiplication
    println!("  Using affine for VAE scaling by 0.18215");
    let scaled_latents = encoded_latents.affine(0.18215, 0.0)?;
    println!("  scaled_latents: shape={:?}, dtype={:?}", scaled_latents.shape(), scaled_latents.dtype());

    // Add noise based on timestep (this handles the "strength" parameter)
    let noised_latents = self.add_noise(&scaled_latents, noise, timestep)?;
    println!("  noised_latents: shape={:?}, dtype={:?}", noised_latents.shape(), noised_latents.dtype());

    Ok(noised_latents)
  }

  /// Apply classifier-free guidance to model output
  pub fn apply_guidance(&self, model_output_uncond: &Tensor, model_output_text: &Tensor, guidance_scale: f64) -> Result<Tensor> {
    // Skip guidance if scale is 1.0 (or very close to it)
    if (guidance_scale - 1.0).abs() < 1e-5 {
      return Ok(model_output_text.clone());
    }

    println!("Applying guidance with scale={:.4}", guidance_scale);
    println!("  model_output_uncond: shape={:?}, dtype={:?}", model_output_uncond.shape(), model_output_uncond.dtype());
    println!("  model_output_text: shape={:?}, dtype={:?}", model_output_text.shape(), model_output_text.dtype());

    // Apply the classifier-free guidance formula:
    // output = uncond + guidance_scale * (text - uncond)

    // First calculate (text - uncond)
    let guidance_diff = (model_output_text - model_output_uncond)?;
    println!("  guidance_diff: shape={:?}, dtype={:?}", guidance_diff.shape(), guidance_diff.dtype());

    // Then scale by guidance_scale using affine for scalar multiplication
    let guidance_factor = guidance_scale - 1.0;
    println!("  Using affine for scaling by {:.4}", guidance_factor);
    let scaled_diff = guidance_diff.affine(guidance_factor, 0.0)?;
    println!("  scaled_diff: shape={:?}, dtype={:?}", scaled_diff.shape(), scaled_diff.dtype());

    // Finally add back to uncond: uncond + guidance_scale * (text - uncond)
    let guided_output = (model_output_uncond + &scaled_diff)?;
    println!("  guided_output: shape={:?}, dtype={:?}", guided_output.shape(), guided_output.dtype());

    Ok(guided_output)
  }

  // Add this helper method to manage dtype consistency across the pipeline
  pub fn ensure_dtype_consistency(&mut self, input_tensor: &Tensor) -> Result<()> {
    // Store the current tensor's dtype for reference
    self.dtype = input_tensor.dtype();
    println!("Setting LCM scheduler dtype to match input: {:?}", self.dtype);
    Ok(())
  }

  // Add a new method to prepare latents with explicit dtype control
  pub fn prepare_latents(&mut self, batch_size: usize, height: usize, width: usize, num_channels_latents: usize, dtype: DType, device: &Device, generator: Option<u64>) -> Result<Tensor> {
    // Store the requested dtype
    self.dtype = dtype;

    // Calculate latent dimensions
    let latent_height = height / 8;
    let latent_width = width / 8;

    // Create random latents
    let shape = Shape::from((batch_size, num_channels_latents, latent_height, latent_width));

    // Note: Candle doesn't have a direct way to set random seeds for tensors
    // So we'll just use regular random generation for now
    let latents = if let Some(seed) = generator {
      println!("Note: Using random latents (seed not supported in this implementation)");
      // In a real implementation, you would want to set the random seed here
      Tensor::randn(0f32, 1f32, shape, device)?
    } else {
      println!("Generating random latents");
      Tensor::randn(0f32, 1f32, shape, device)?
    };

    // Convert to the requested dtype
    let latents = latents.to_dtype(dtype)?;
    println!("Generated latents: shape={:?}, dtype={:?}", latents.shape(), latents.dtype());

    // Scale by the init_noise_sigma
    let scaled_latents = latents.affine(self.init_noise_sigma, 0.0)?;

    Ok(scaled_latents)
  }

  // Add this method to maintain dtype consistency across operations
  pub fn match_dtype(&self, tensor: &Tensor, dtype: Option<DType>) -> Result<Tensor> {
    match dtype {
      Some(d) => tensor.to_dtype(d),
      None => Ok(tensor.clone()),
    }
  }

  // Add this public getter for the dtype field
  pub fn dtype(&self) -> DType {
    self.dtype
  }
}
