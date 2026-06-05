"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (data: {
    name: string;
    phone?: string;
    company?: string;
    website?: string;
    bio?: string;
    photoURL?: string | null;
  }) => Promise<void>;
  saving?: boolean;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

function isLikelyUrl(value: string): boolean {
  if (!value) return true;
  return /^https?:\/\/[\w.-]+/i.test(value);
}

export default function ProfileForm({
  profile,
  onSave,
  saving = false,
  onSuccess,
  onError,
}: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [photoURL, setPhotoURL] = useState(profile.photoURL ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!editing) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setCompany(profile.company ?? "");
      setWebsite(profile.website ?? "");
      setBio(profile.bio ?? "");
      setPhotoURL(profile.photoURL ?? "");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [profile, editing]);

  const cancel = () => {
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setCompany(profile.company ?? "");
    setWebsite(profile.website ?? "");
    setBio(profile.bio ?? "");
    setPhotoURL(profile.photoURL ?? "");
    setLocalError(null);
    setEditing(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!name.trim()) {
      setLocalError("Name is required.");
      return;
    }
    if (website.trim() && !isLikelyUrl(website.trim())) {
      setLocalError("Website must start with http:// or https://");
      return;
    }
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        website: website.trim() || undefined,
        bio: bio.trim() || undefined,
        photoURL: photoURL.trim() || null,
      });
      setEditing(false);
      onSuccess?.("Profile updated.");
    } catch (err) {
      const msg = (err as Error).message || "Failed to save profile.";
      setLocalError(msg);
      onError?.(msg);
    }
  };

  const avatar = photoURL || profile.photoURL || null;
  const initials = (name || profile.email || "U")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!editing) {
    return (
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={profile.name}
              className="h-16 w-16 rounded-2xl object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-lg font-semibold">
              {initials || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
              Profile
            </p>
            <h3 className="text-xl font-bold text-zinc-50 truncate">
              {profile.name || "Unnamed user"}
            </h3>
            <p className="text-sm text-zinc-400 truncate">{profile.email}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Field label="Role" value={profile.role ?? "user"} />
          <Field
            label="Phone"
            value={profile.phone || "—"}
            empty={!profile.phone}
          />
          <Field
            label="Company"
            value={profile.company || "—"}
            empty={!profile.company}
          />
          <Field
            label="Website"
            value={profile.website || "—"}
            empty={!profile.website}
            href={profile.website}
          />
          <Field
            label="Bio"
            value={profile.bio || "—"}
            empty={!profile.bio}
            full
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        {photoURL.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoURL}
            alt={name}
            className="h-16 w-16 rounded-2xl object-cover border border-white/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-lg font-semibold">
            {initials || "U"}
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Editing profile
          </p>
          <h3 className="text-xl font-bold text-zinc-50">{profile.email}</h3>
          <p className="text-xs text-zinc-500">
            Email is read-only — it comes from your auth provider.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
        />
        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
        />
        <Input
          label="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
        <Input
          label="Photo URL"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="Email (read-only)"
          value={profile.email}
          readOnly
          disabled
        />
      </div>

      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="A short description about you."
        rows={3}
      />

      {localError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {localError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" variant="primary" size="md" loading={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={cancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  empty,
  full,
  href,
}: {
  label: string;
  value: string;
  empty?: boolean;
  full?: boolean;
  href?: string;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-sm text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p
          className={`text-sm ${empty ? "text-zinc-600 italic" : "text-zinc-200"} break-words`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
