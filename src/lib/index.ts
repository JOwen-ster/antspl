import { asset } from "$app/paths";

export function profileAsset(filename: string) {
  return asset(filename as Parameters<typeof asset>[0]);
}
