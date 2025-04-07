import VideoCall from "@/app/features/videocall/videocall";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <VideoCall role="doctor" />
    </main>
  )
}

