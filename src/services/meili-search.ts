import { AbstractSearchService } from '@medusajs/utils';
import { MeiliSearch } from 'meilisearch';
import { Lifetime } from 'awilix';

class MeiliSearchService extends AbstractSearchService {
  isDefault = false; // use custom search
  static LIFE_TIME = Lifetime.SINGLETON;
  private client_: MeiliSearch;

  constructor() {
    // @ts-expect-error prefer-rest-params
    super(...arguments);
    this.client_ = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY,
    });
  }
  createIndex(indexName: string, options: unknown): unknown {
    return this.client_.createIndex(indexName, options);
  }
  async getIndex(indexName: string) {
    try {
      return this.client_.index(indexName);
    } catch (error) {
      if (error.message === 'index_not_found') {
        await this.client_.createIndex(indexName);
        return this.client_.index(indexName);
      }
    }
  }
  async addDocuments(
    indexName: string,
    documents: Record<string, any>[],
    type: string
  ) {
    const index = await this.getIndex(indexName);
    return index.addDocuments(documents, {
      primaryKey: 'id',
    });
  }
  async replaceDocuments(
    indexName: string,
    documents: Record<string, any>[],
    type: string
  ) {
    return (await this.getIndex(indexName)).updateDocuments(documents);
  }
  async deleteDocument(indexName: string, document_id: string | number) {
    return (await this.getIndex(indexName)).deleteDocument(document_id);
  }
  async deleteAllDocuments(indexName: string) {
    return (await this.getIndex(indexName)).deleteAllDocuments();
  }
  async search(indexName: string, query: string, options: unknown) {
    return (await this.getIndex(indexName)).search(query, options);
  }
  updateSettings(indexName: string, settings: unknown): unknown {
    throw new Error('Method not implemented.');
  }
}

export default MeiliSearchService;
