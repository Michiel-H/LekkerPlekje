export const metadata = { title: "Offline · LekkerPlekje" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-espresso">Even geen verbinding</h1>
      <p className="mt-2 max-w-sm text-espresso-light">
        Je bent offline. Zodra je weer internet hebt, staan alle lekkere plekjes weer voor je klaar.
      </p>
    </main>
  );
}
