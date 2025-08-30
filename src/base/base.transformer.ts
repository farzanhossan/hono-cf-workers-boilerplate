export interface Transformer {
  transform(transformerDataInput: unknown): unknown
}

export interface CollectionTransformer {
  transformCollection(transformerDataInput: unknown[]): unknown[]
}
