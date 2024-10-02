use crate::plans::model_weights::evaluate::test_cases::zelda::test_zelda_searches;
use elasticsearch::Elasticsearch;
use errors::AnyhowResult;

pub async fn evaluate_model_weights_search(client: &Elasticsearch) -> AnyhowResult<()> {
  test_zelda_searches(client).await?;

  Ok(())
}

