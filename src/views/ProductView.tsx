import { GetServerSideProps } from 'next';
import { dehydrate, DehydratedState } from 'react-query/hydration';
import { createQueryClient } from '@src/query-client/QueryClientUtils';
import ErrorMessage from '@src/error-handling/ErrorMessage';
import ProductDetail from '@src/products/ProductDetail';
import { parseRouteParams } from '@src/routing/RoutingUtils';
import AppLayout from '@src/app-layout/AppLayout';
import Loading from '@src/common/Loading';
import { useRouteParams } from '@src/routing/useRouteParams';
import BaseSeo from '@src/seo/BaseSeo';
import Panel from '@src/common/Panel';
import React from 'react';
import PageHeader from '@src/common/PageHeader';
import { PathParams, routes } from '@src/routing/routes';
import { useQuery } from 'react-query';
import { productsAPI } from '@src/products/productsAPI';

type ProductViewPathParams = PathParams<typeof routes['product']>;

interface ProductViewProps {
  // eslint-disable-next-line react/no-unused-prop-types
  dehydratedState?: DehydratedState;
}

function ProductView() {
  const { routeParams } = useRouteParams<ProductViewPathParams>();
  const productId = Number(routeParams.get('productId'));
  const {
    data: product,
    isLoading,
    error,
  } = useQuery(productsAPI.fetchOneProduct({ args: { productId } }));

  return (
    <>
      <BaseSeo
        title={product?.title}
        description={product?.description}
        images={
          product?.image
            ? [
                {
                  url: product?.image,
                  alt: `Product image of ${product.title}`,
                },
              ]
            : undefined
        }
      />
      <PageHeader title={product?.title} />
      <Loading isLoading={isLoading}>
        <ErrorMessage error={error}>
          {product && (
            <Panel>
              <ProductDetail product={product} />
            </Panel>
          )}
        </ErrorMessage>
      </Loading>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ProductViewProps> = async (
  ctx,
) => {
  // Using hydration:
  // https://react-query.tanstack.com/guides/ssr#using-hydration
  const queryClient = createQueryClient();
  const productId = Number(
    parseRouteParams<ProductViewPathParams>(ctx.query).get('productId'),
  );
  await queryClient.prefetchQuery(
    productsAPI.fetchOneProduct({
      args: { productId },
    }),
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

ProductView.Layout = AppLayout;

export default ProductView;
