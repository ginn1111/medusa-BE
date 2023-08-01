import { ProductService } from '@medusajs/medusa';
import { AwilixContainer } from 'awilix';
import MeiliSearchService from 'services/meili-search';

export default async (container: AwilixContainer): Promise<void> => {
  const productService: ProductService = container.resolve('productService');
  const meiliSearchService =
    container.resolve<MeiliSearchService>('meiliSearchService');
  const productList = await productService.list({});
  await meiliSearchService.addDocuments('products', productList, 'products');
};
