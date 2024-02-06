use opentelemetry::metrics::{Counter, Histogram, Meter, Unit, UpDownCounter};
use opentelemetry_sdk::metrics::data::Gauge;

pub struct JobInstruments {
    pub job_duration: Histogram<u64>,
    pub inference_command_execution_duration: Histogram<u64>,
    pub batch_query_duration: Histogram<u64>,
    pub batch_size: Histogram<u64>,
    pub batch_processing_duration: Histogram<u64>,
    pub total_job_count: Counter<u64>,
    pub job_success_count: Counter<u64>,
    pub job_failure_count: Counter<u64>,
}

impl JobInstruments {
    pub fn new_from_meter(meter: Meter) -> Self {
        let job_duration = meter.u64_histogram("inference_job_duration")
            .with_unit(Unit::new("milliseconds"))
            // job type could be a label, and this instrument could be common for all jobs
            .with_description("inference job duration")
            .init();

        let batch_query_duration = meter.u64_histogram("inference_job_batch_query_duration")
            .with_unit(Unit::new("milliseconds"))
            .with_description("inference job batch query duration")
            .init();

        let batch_size = meter.u64_histogram("inference_job_batch_size")
            .with_unit(Unit::new("jobs"))
            .with_description("inference job batch size")
            .init();

        let inference_command_execution_duration = meter.u64_histogram("inference_job_inference_command_execution_duration")
            .with_unit(Unit::new("milliseconds"))
            .with_description("inference job inference command execution duration")
            .init();

        let batch_processing_duration = meter.u64_histogram("inference_job_batch_processing_duration")
            .with_unit(Unit::new("milliseconds"))
            .with_description("inference job batch processing duration")
            .init();

        let total_job_count = meter.u64_counter("inference_job_total_job_count")
            .with_unit(Unit::new("jobs"))
            .with_description("inference job total job count")
            .init();

        let job_success_count = meter.u64_counter("inference_job_success_count")
            .with_unit(Unit::new("jobs"))
            .with_description("inference job success count")
            .init();

        let job_failure_count = meter.u64_counter("inference_job_failure_count")
            .with_unit(Unit::new("jobs"))
            .with_description("inference job failure count")
            .init();

        Self {
            job_duration,
            inference_command_execution_duration,
            batch_query_duration,
            batch_size,
            batch_processing_duration,
            total_job_count,
            job_success_count,
            job_failure_count,
        }
    }
}