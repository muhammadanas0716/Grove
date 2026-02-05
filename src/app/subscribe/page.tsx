import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SubscribeClient from "./subscribe-client";

export default async function SubscribePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/subscribe");
  }

  return (
    <SubscribeClient />
  );
}
