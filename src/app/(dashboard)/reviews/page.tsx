import { ReviewsTable } from "./components/reviews-table";

export default async function ReviewsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const page = Number(values.page);
  const limit = Number(values.limit);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">Browse customer feedback and product ratings.</p>
      </div>
      <ReviewsTable params={{
        page: Number.isSafeInteger(page) && page > 0 ? page : 1,
        limit: [10, 20, 30, 40, 50].includes(limit) ? limit : 10,
      }} />
    </div>
  );
}
