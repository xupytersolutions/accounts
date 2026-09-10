import { SpaceClient } from "@/components/space-client";

export default async function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpaceClient spaceId={id} />;
}
