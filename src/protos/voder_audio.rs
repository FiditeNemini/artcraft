#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioRequest {
    #[prost(int32, repeated, tag="1")]
    pub integer_audio: ::std::vec::Vec<i32>,
    #[prost(float, repeated, tag="2")]
    pub float_audio: ::std::vec::Vec<f32>,
    #[prost(bool, tag="3")]
    pub skip_vocode: bool,
    #[prost(string, tag="4")]
    pub test_name: std::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodeAudioResponse {
    #[prost(int32, repeated, tag="1")]
    pub integer_audio: ::std::vec::Vec<i32>,
    #[prost(float, repeated, tag="2")]
    pub float_audio: ::std::vec::Vec<f32>,
    #[prost(string, tag="3")]
    pub test_name: std::string::String,
}
