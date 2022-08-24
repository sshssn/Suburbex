import { Image } from '@crystallize/reactjs-components';
import { Link } from '@remix-run/react';
import { useAppContext } from '~/core/app-context/provider';
import { ItemViewComponentProps } from '~/lib/grid-tile/types';
import displayPriceFor from '~/lib/pricing/pricing';
import { Price } from '../price';

export const Product: React.FC<ItemViewComponentProps> = ({ item }) => {
    const name = item?.defaultVariant?.name || item.name;
    const image = item?.defaultVariant?.firstImage || item?.defaultVariant?.images?.[0];
    const { state } = useAppContext();
    const { percent: discountPercentage } = displayPriceFor(
        item?.defaultVariant,
        {
            default: 'default',
            discounted: 'sales',
        },
        state.currency.code,
    );

    return (
        <Link
            to={item.path}
            prefetch="intent"
            className="grid grid-rows-[1fr_60px] place-items-stretch min-h-full w-full justify-stretch items-stretch relative"
        >
            {discountPercentage > 0 && (
                <div className="absolute top-3 right-2 bg-green2 items-center flex z-[20] justify-center rounded-full w-[45px] h-[45px] text-[#fff] text-sm">
                    -{discountPercentage}%
                </div>
            )}
            <div className="img-container img-contain border-solid border border-[#dfdfdf] min-h-full bg-[#fff] rounded-md h-full overflow-hidden grow-1">
                <Image {...image} sizes="300px" loading="lazy" />
            </div>
            <div className="pl-1 h-[1/4] ">
                <h3 className="text-md">{name}</h3>
                <Price variant={item.defaultVariant} size="small" />
            </div>
        </Link>
    );
};
