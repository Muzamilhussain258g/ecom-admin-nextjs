import { OrderDetail } from "./components/order-detail";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  return <OrderDetail orderId={orderId} />;
}
