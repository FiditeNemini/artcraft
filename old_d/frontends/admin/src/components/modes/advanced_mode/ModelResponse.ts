
class ModelResponse {
  tacotron?: ModelDetails[]
  melgan?: ModelDetails[]
}

class ModelDetails {
  file_path?: string
  description?: string
  base_name?: string
}

export {ModelResponse, ModelDetails};
