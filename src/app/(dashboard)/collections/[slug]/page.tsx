import { CollectionDetail } from "./components/collection-detail";

type CollectionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="@container/main px-4 lg:px-6">
      <CollectionDetail slug={decodeURIComponent(slug)} />
    </div>
  );
}
