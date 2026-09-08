import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/actions";
import { Card, Button, Input, TextField, Label } from "@heroui/react";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Account</h1>
      <Card className="border border-border bg-card shadow-sm">
        <Card.Content className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? "User"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">{(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.name ?? "User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form action={updateProfile} className="space-y-4">
            <TextField name="name" defaultValue={user.name ?? ""} className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Name</Label>
              <Input placeholder="Your name" className="h-10" />
            </TextField>

            <TextField name="image" defaultValue={user.image ?? ""} className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Avatar image URL</Label>
              <Input placeholder="https://..." className="h-10" />
            </TextField>

            <TextField isDisabled className="w-full">
              <Label className="text-sm font-medium text-foreground mb-2">Email</Label>
              <Input value={user.email} className="h-10 bg-muted" />
            </TextField>
            <p className="text-xs text-muted-foreground -mt-2">Email is managed by your provider.</p>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-primary text-primary-foreground font-medium">Save changes</Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
