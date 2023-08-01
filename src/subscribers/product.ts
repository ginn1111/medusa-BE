import { EventBusService, ProductService } from '@medusajs/medusa';
import MeiliSearchService from 'services/meili-search';

type InjectedDependencies = {
  meiliSearchService: MeiliSearchService;
  eventBusService: EventBusService;
  productService: ProductService;
};

class ProductSearchSubscriber {
  protected readonly _meiliSearchService: MeiliSearchService;
  protected readonly _productService: ProductService;
  constructor({
    meiliSearchService,
    eventBusService,
    productService,
  }: InjectedDependencies) {
    this._meiliSearchService = meiliSearchService;
    this._productService = productService;
    eventBusService.subscribe(
      ProductService.Events.CREATED,
      this.handleProductCreation
    );
    eventBusService.subscribe(
      ProductService.Events.DELETED,
      this.handleProductDeletion
    );
    eventBusService.subscribe(
      ProductService.Events.UPDATED,
      this.handleProductUpdation
    );
  }

  handleProductUpdation = async (data: { id: string }) => {
    const updatedProduct = await this._productService.retrieve(data.id);
    await this._meiliSearchService.replaceDocuments(
      ProductService.IndexName,
      [updatedProduct],
      ProductService.IndexName
    );
  };

  handleProductCreation = async (data: { id: string }) => {
    const createdProduct = await this._productService.retrieve(data.id);
    await this._meiliSearchService.addDocuments(
      ProductService.IndexName,
      [createdProduct],
      ProductService.IndexName
    );
  };
  handleProductDeletion = async (data: { id: string }) => {
    await this._meiliSearchService.deleteDocument(
      ProductService.IndexName,
      data.id
    );
  };
}

export default ProductSearchSubscriber;
