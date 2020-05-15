
class ModelResponse {
  tacotron?: ModelDetails[]
  melgan?: ModelDetails[]
}

class ModelDetails {
  file?: string
  description?: string
}

export {ModelResponse, ModelDetails};
