#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioRequest {
    #[prost(float, repeated, tag="1")]
    pub float_audio: ::std::vec::Vec<f32>,
    /// We'll resend these params for every batch, but will only use
    /// the last batch's settings. Kind of a dumb API, but it'll work.
    #[prost(int32, tag="2")]
    pub sample_rate: i32,
    #[prost(bool, tag="3")]
    pub skip_resample: bool,
    #[prost(bool, tag="4")]
    pub skip_vocode: bool,
    /// Debugging
    #[prost(bool, tag="5")]
    pub save_files: bool,
    /// How big we let the buffer grow before running 'convert'.
    #[prost(int32, tag="6")]
    pub buffer_size_minimum: i32,
    /// Requested output rate
    #[prost(int32, tag="7")]
    pub output_rate: i32,
    /// Discard the vocoded audio and return the original
    #[prost(bool, tag="8")]
    pub discard_vocoded_audio: bool,
    /// Rate param for the model
    #[prost(int32, tag="9")]
    pub model_sampling_rate: i32,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioResponse {
    #[prost(float, repeated, tag="1")]
    pub float_audio: ::std::vec::Vec<f32>,
}
