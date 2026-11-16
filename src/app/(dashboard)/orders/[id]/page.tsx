import { notFound } from "next/navigation";
import { OrderDetailPage } from "./components/order-detail-page";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(orderId) || orderId < 1) {
    notFound();
  }

  return <OrderDetailPage id={orderId} />;
}
