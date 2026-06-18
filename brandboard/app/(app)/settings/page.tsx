import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Settings
      </h1>
      <p className="mt-1 text-muted-foreground">
        Manage your profile and workspace preferences.
      </p>

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <Separator className="my-4" />
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/15 text-lg text-primary">
                DL
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change avatar
            </Button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="David Lee" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="david@studio.com" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            <PreferenceRow
              label="Email notifications"
              hint="Get notified when a board finishes generating."
              defaultChecked
            />
            <PreferenceRow
              label="Auto-save boards"
              hint="Save canvas changes automatically."
              defaultChecked
            />
            <PreferenceRow
              label="Usage analytics"
              hint="Help improve Brandboard with anonymous usage data."
            />
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  label,
  hint,
  defaultChecked,
}: {
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
