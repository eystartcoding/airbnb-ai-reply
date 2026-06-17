import GuestReplyForm from "./components/guest-reply-form";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Guest Reply
          </h1>
          <p className="text-sm text-zinc-500">
            Enter a guest message and generate an AI reply.
          </p>
        </div>
        <GuestReplyForm />
      </div>
    </main>
  );
}
