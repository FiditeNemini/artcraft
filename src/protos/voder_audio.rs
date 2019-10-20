#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioRequest {
    #[prost(float, repeated, tag="1")]
    pub float_audio: ::std::vec::Vec<f32>,
    /// We'll resend these params for every batch, but will only use
    /// the last batch's settings. Kind of a dumb API, but it'll work.
    #[prost(int32, tag="2")]
    pub sample_rate: i32,
    #[prost(bool, tag="3")]
    pub skip_vocode: bool,
    #[prost(bool, tag="4")]
    pub save_files: bool,
    /// How big we let the buffer grow before running 'convert'.
    #[prost(int32, tag="5")]
    pub buffer_size_minimum: i32,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioResponse {
    #[prost(float, repeated, tag="1")]
    pub float_audio: ::std::vec::Vec<f32>,
}
