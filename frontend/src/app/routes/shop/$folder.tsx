import { HeadersFunction, json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { HttpCacheHeaderTaggerFromLoader, SuperFastHttpCacheHeaderTagger } from '~/core/Http-Cache-Tagger';
import { fetchFolder, fetchProducts, getPriceRange, searchOrderBy } from '~/core/UseCases';
import { Filter } from '~/core/components/filter';
import { getSuperFast } from 'src/lib/superfast/SuperFast';
import { FilteredProducts, ProductsList } from '~/core/components/filter/filtered-products';
import sliderStyles from 'rc-slider/assets/index.css';

export function links() {
    return [{ rel: 'stylesheet', href: sliderStyles }];
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
    return HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers;
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const url = new URL(request.url);
    const preview = url.searchParams.get('preview');
    const version = preview ? 'draft' : 'published';
    const path = `/shop/${params.folder}`;
    const superFast = await getSuperFast(request.headers.get('Host')!);
    const folder = await fetchFolder(superFast.apiClient, path, version);
    const products = await fetchProducts(superFast.apiClient, path);
    let filteredProducts = [];
    let orderSearchParams = url.searchParams.get('orderBy');
    let priceSearchParams = { min: url.searchParams.get('min'), max: url.searchParams.get('max') };
    filteredProducts = orderSearchParams
        ? await searchOrderBy(superFast.apiClient, path, orderSearchParams, priceSearchParams)
        : [];

    const priceRange = await getPriceRange(superFast.apiClient, path);

    return json(
        { products, folder, filteredProducts, priceRange },
        SuperFastHttpCacheHeaderTagger('30s', '30s', [path], superFast.config),
    );
};

export default function FolderPage() {
    const { folder, products, filteredProducts, priceRange } = useLoaderData();
    let title = folder?.components.find((component: any) => component.type === 'singleLine')?.content?.text;
    let description = folder?.components.find((component: any) => component.type === 'richText')?.content?.plainText;

    return (
        <div className="lg:w-content mx-auto w-full">
            <h1 className="text-3xl font-bold mt-10 mb-4">{title}</h1>
            <p className="w-3/5 mb-10">{description}</p>
            <Filter priceRange={priceRange} />
            {filteredProducts?.search?.edges.length > 0 ? (
                <FilteredProducts products={filteredProducts?.search?.edges} />
            ) : (
                <ProductsList products={products} />
            )}
        </div>
    );
}
