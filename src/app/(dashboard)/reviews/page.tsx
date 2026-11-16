import { ReviewsTable } from "./components/reviews-table";
import type { ListReviewsParams } from "@/features/reviews/types";

type ReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPositiveInteger(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readStars(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const stars = Number(value);
  return Number.isFinite(stars) &&
    stars >= 1 &&
    stars <= 5 &&
    Number.isInteger(stars * 10)
    ? stars
    : undefined;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const values = await searchParams;
  const page = readPositiveInteger(values.page) ?? 1;
  const requestedLimit = readPositiveInteger(values.limit) ?? 10;
  const limit = [10, 20, 30, 40, 50, 100].includes(requestedLimit)
    ? requestedLimit
    : 10;
  const search = typeof values.search === "string" ? values.search.trim() : "";
  const productId = readPositiveInteger(values.productId);
  const stars = readStars(values.stars);
  const params: ListReviewsParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(productId !== undefined ? { productId } : {}),
    ...(stars !== undefined ? { stars } : {}),
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground text-sm">Browse customer feedback and product ratings.</p>
      </div>
      <ReviewsTable
        key={`${page}-${limit}-${search}-${productId}-${stars}`}
        params={params}
      />
    </div>
  );
}
