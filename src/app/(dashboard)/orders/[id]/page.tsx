import { notFound } from "next/navigation";
import { OrderDetailPage } from "./components/order-detail-page";

export default async function OrderPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(orderId) || orderId < 1) notFound();

  return <OrderDetailPage id={orderId} />;
}
