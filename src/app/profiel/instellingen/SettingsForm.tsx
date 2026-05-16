"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DISPLAY_NAME_MAX, validateDisplayName } from "@/lib/displayName";

type Pronoun = "vent" | "griet" | "neutraal";

interface Props {
  userId: string;
  displayName: string;
  pronoun: Pronoun;
}

export default function SettingsForm({
  userId,
  displayName: initialName,
  pronoun: initialPronoun,
}: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [pronoun, setPronoun] = useState<Pronoun>(initialPronoun);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMsg(null);

    const validationError = validateDisplayName(displayName);
    if (validationError) {
      setProfileMsg(validationError);
      setSavingProfile(false);
      return;
    }

    const supabase = createClient();
    const trimmedName = displayName.trim();

    // Only run the uniqueness check when the name actually changed —
    // skip the round trip on no-op saves and avoid matching the user's own row.
    if (trimmedName.toLowerCase() !== initialName.toLowerCase()) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .ilike("display_name", trimmedName)
        .neq("id", userId)
        .limit(1);
      if (existing && existing.length > 0) {
        setProfileMsg("Deze gebruikersnaam is al in gebruik. Kies een andere.");
        setSavingProfile(false);
        return;
      }
    }

    const { error } = await supabase
      .from("users")
      .update({ display_name: trimmedName, pronoun } as never)
      .eq("id", userId);
    setSavingProfile(false);
    if (error) {
      setProfileMsg("Opslaan mislukt: " + error.message);
    } else {
      setProfileMsg("Opgeslagen ✓");
      router.refresh();
    }
  }

  async function changePassword() {
    setSavingPwd(true);
    setPwdMsg(null);
    setPwdErr(null);
    if (newPassword.length < 8) {
      setPwdErr("Wachtwoord moet minimaal 8 tekens zijn.");
      setSavingPwd(false);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) setPwdErr(error.message);
    else {
      setPwdMsg("Wachtwoord gewijzigd ✓");
      setNewPassword("");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteErr(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteErr(body.error ?? "Verwijderen mislukt.");
        setDeleting(false);
        return;
      }
      // Server already signed us out — clear client session cache too
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setDeleteErr(err?.message ?? "Verwijderen mislukt.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile fields */}
      <section className="rounded-2xl bg-white border border-espresso/8 p-6">
        <h2 className="font-display text-lg font-semibold text-espresso mb-4">
          Profielgegevens
        </h2>

        <label className="block text-sm font-medium text-espresso mb-1.5">
          Weergavenaam
        </label>
        <input
          type="text"
          maxLength={DISPLAY_NAME_MAX}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
        />
        <p className="mt-1 text-xs text-espresso-light/70">
          3–24 tekens, alleen letters, cijfers, _ en -
        </p>

        <label className="block text-sm font-medium text-espresso mt-4 mb-2">
          Hoe wil je genoemd worden?
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: "vent", label: "Lekker ventje" },
              { value: "griet", label: "Lekker grietje" },
              { value: "neutraal", label: "Toppertje" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPronoun(opt.value)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                pronoun === opt.value
                  ? "border-spritz bg-spritz/10 text-spritz"
                  : "border-espresso/10 text-espresso-light hover:border-espresso/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-full bg-spritz px-4 py-2 text-sm font-medium text-white hover:bg-spritz-hover transition-colors disabled:opacity-50"
          >
            {savingProfile ? "Bezig..." : "Opslaan"}
          </button>
          {profileMsg && (
            <span className="text-xs text-espresso-light">{profileMsg}</span>
          )}
        </div>
        <p className="mt-3 text-xs text-espresso-light/70">
          Je profielfoto, bio en stad bewerk je direct op de profielpagina.
        </p>
      </section>

      {/* Password */}
      <section className="rounded-2xl bg-white border border-espresso/8 p-6">
        <h2 className="font-display text-lg font-semibold text-espresso mb-4">
          Wachtwoord wijzigen
        </h2>
        <input
          type="password"
          placeholder="Nieuw wachtwoord (min. 8 tekens)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-2.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-spritz/50"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={changePassword}
            disabled={savingPwd || !newPassword}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-creme hover:bg-espresso-light transition-colors disabled:opacity-50"
          >
            {savingPwd ? "Bezig..." : "Wachtwoord wijzigen"}
          </button>
          {pwdMsg && <span className="text-xs text-frisgroen">{pwdMsg}</span>}
          {pwdErr && <span className="text-xs text-koraal">{pwdErr}</span>}
        </div>
      </section>

      {/* Delete account */}
      <section className="rounded-2xl bg-koraal/5 border border-koraal/20 p-6">
        <h2 className="font-display text-lg font-semibold text-koraal mb-2">
          Gevarenzone
        </h2>
        <p className="text-sm text-espresso-light mb-4">
          Je account verwijderen is definitief. Je plekjes blijven staan, maar je
          profiel verdwijnt en je wordt uitgelogd.
        </p>
        {!deleteOpen ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="rounded-full bg-koraal/10 px-4 py-2 text-sm font-medium text-koraal hover:bg-koraal/20 transition-colors"
          >
            Account verwijderen
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-espresso">Weet je het zeker?</span>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="rounded-full bg-koraal px-4 py-2 text-sm font-medium text-white hover:bg-koraal/80 transition-colors disabled:opacity-50"
            >
              {deleting ? "Bezig..." : "Ja, verwijder mijn account"}
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-full bg-espresso/5 px-4 py-2 text-sm font-medium text-espresso-light hover:bg-espresso/10 transition-colors"
            >
              Annuleren
            </button>
            {deleteErr && (
              <span className="text-xs text-koraal">{deleteErr}</span>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
